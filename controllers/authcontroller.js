const User = require('../modules/userModule');
const jwt = require('jsonwebtoken');
const asyncCatch = require('../utils/asyncCatch');
const appError = require('../utils/appError');
const AppError = require('../utils/appError');
const emailSender = require('../utils/email');
const crypto = require('crypto');
const Email =require('../utils/email');
const { hostname } = require('os');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECURITY_KEY, {
    expiresIn: process.env.TOKEN_EXPIRATION,
  });
};

const createAndSendToken = (user, statuscode,req,  res) => {
  const token = generateToken(user._id);
   const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 'none' for cross-site, 'strict' for same-site
  };

  // Handle both direct HTTPS and proxy HTTPS
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  }


  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  return res.status(statuscode).json({
    data: user,
    token,
    status: 'success',
  });
};

exports.signUp = async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedTimeAt: req.body.passwordChangedTimeAt,
    user: req.body.user,
  });
// welcome email for new users
const url = `${req.protocol}://${req.get('host')}/me`
await new Email(user , url).sendWelcome()

  createAndSendToken(user, 200,req, res);
};
exports.login = asyncCatch(async (req, res, next) => {
  const { email, password } = req.body;
  // 1. shoot the error to global error handler if either of the password or email not given
  if (!email || !password)
    return next(new AppError('email or password not entered'));

  // 2. filter the user details with given email using find mongoose method
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3. if everythingis okay then send token to the client
  createAndSendToken(user, 201, req,res);

  // here goes responce
});

exports.protectRoute = asyncCatch(async (req, res, next) => {
  let tokenFromHeader;
  // 1. getting token and check its there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    tokenFromHeader = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    tokenFromHeader = req.cookies.jwt;
  }
  if (!tokenFromHeader)
    return next(new AppError('access denied for current request'));
  // 2. verificattion token
  const decoded = jwt.verify(tokenFromHeader, process.env.JWT_SECURITY_KEY);
  // 3. check if user exits
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        'the corresponding user for this token has either deleted or dead',
      ),
    );
  // 4. check if user changed password after the jwt was expired
  const oldTokendetector = await currentUser.tokenUsageAfterChangedPassword(
    decoded.iat,
  );
  if (oldTokendetector) {
    return next(new AppError('old token detected kindly login'));
  }
  req.user = currentUser;
  next();
});
exports.protectPage = asyncCatch(async (req, res, next) => {
  let tokenFromHeader;

  // 1. getting token from cookiee if not found return next
  if (req.cookies) {
    tokenFromHeader = req.cookies.jwt;

    if (!tokenFromHeader) return next();
    try {
      // 2. verificattion cookie token
      const decoded = jwt.verify(tokenFromHeader, process.env.JWT_SECURITY_KEY);
      // 3. check if user exits
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();
      // 4. check if user changed password after the jwt was expired
      const oldTokendetector = await currentUser.tokenUsageAfterChangedPassword(
        decoded.iat,
      );
      
      if (oldTokendetector) {
        
        return next();
        
      }
     
      res.locals.user = currentUser;
     

      return next();
    } catch (error) {
      return next();
    }
  }
  next();
});
// here is autherization happnes with three peoples

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // the authorixed roles for delete users are admin, lead-guide

    if (!roles.includes(req.user.role)) {
      return next(
        new appError(
          'your unathorized to do this action please reachout admin',
          401,
        ),
      );
    }
    next();
  };
};

exports.forgotPassword = asyncCatch(async (req, res, next) => {
  // 1. get user based on   poted email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('no user found for this email kindly signin'));

  // 2. generate a random toaken for reset
  const token = await user.forgotPasswordTokenProvider();
  user.save({ validateBeforeSave: false });

  // 3. send it to users email
  const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${token}`;
  // this reseturl sent to mailltrapper by our mailtrapper captures it using this url we get token and end using that we filter throug users and update new password
  const message = `mail sent to ${user.email}`;

  try {
    await new Email(user , resetUrl).sendPasswordReset()
  } catch (err) {
    user.passwordToken = undefined;
    user.passwordTokenExpiration = undefined;
    return next(new AppError(`please try agaon ${err}`, 500));
  }
  res.status(201).json({
    user: user,
    token: token,
    message: 'resent token sent to particular gmail id' + user.email,
  });
});

exports.resetPassword = async (req, res, next) => {
  // 1. GET USER BASED ON THE TOKEN
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({ passwordToken: hashedToken });

  // 2. IF TOKEN HAS NOT EXPIRED, AND THERE IS USER, SET THE NEW PASSWORD
  if (!user || user.passwordTokenExpiration < Date.now())
    return next(
      new AppError('your token expired kindly request new token', 401),
    );

  // 3. UPDATE CHANGEDPASSWORD PROPERTY FOR THE USER AND SAVE IN DB
  if (!req.body.password || !req.body.passwordConfirm) {
    return next(new AppError('password or confirm passwrod not filled', 401));
  } else {
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    ((user.passwordTokenExpiration = undefined),
      (user.passwordToken = undefined));
    await user.save();
  }

  // 4. LOG THE USER IN , SEND JWT
  createAndSendToken(user, 201, req, res);
};

exports.updatePassword = asyncCatch(async (req, res, next) => {
  // {const { password, newPassword, passwordConfirm } = req.body;
  // console.log(
  // req.body.password,
  // newPassword,
  // passwordConfirm + '**************************',
  // );

  // // took jwt from header authirixation and decoded to get id and filtered user using id to update password
  // let tokenFromHeader;
  // if (
  // req.headers.authorization &&
  // req.headers.authorization.startsWith('Bearer')
  // ) {
  // tokenFromHeader = req.headers.authorization.split(' ')[1];
  // } else {
  // return next(new AppError('token not applicable', 402));
  // }
  // const decoded = jwt.verify(tokenFromHeader, process.env.JWT_SECURITY_KEY);
  // console.log(decoded);

  // // 1. get user from collection
  // const user = await User.findById(decoded.id).select('+password');
  // if (!user) return next(new AppError('user not found', 402));

  // // 2. check if posted currect password is correct
  // if (!user || !(await user.correctPassword(password, user.password))) {
  // return next(new AppError('Incorrect email or password', 401));
  // }

  // console.log(user);

  // // 3. if so update password

  // user.password = newPassword;
  // user.passwordConfirm = passwordConfirm;
  // user.save();
  // // 4. log user in, send jwt
  // const token = generateToken(decoded.id);
  // }

  const user = await User.findById(req.user._id).select('+password');
  // 1. get user from collection

 
  // 2. check if posted currect password is correct
  if (!(await user.correctPassword(req.body.password, user.password)))
    return next(new AppError('password is incorrect for update password', 401));
  

  // 3. if so update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. log user in, send jwt
  createAndSendToken(user, 201,req, res);
});

exports.logout = async (req, res, next) => {
  res.cookie('jwt', 'shinchans butt', {
    httpOnly: true,
    expiresIn: new Date(Date.now + 1 * 1000),
  });

  res.status(200).json({
    status: 'success',
  });
};
