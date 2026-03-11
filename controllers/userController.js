const User = require('../modules/userModule');
const asyncCatch = require('../utils/asyncCatch');
const Error = require('../utils/appError');
const { use } = require('../routes/tourRoutes');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');
const multer = require('multer');
const sharp = require('sharp');

// const storage = multer.diskStorage({
//   destination: (res, req, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const storage = multer.memoryStorage();
const filterFile = (res, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage, filterFile });

exports.uploadUserPhoto = upload.single('photo');

exports.reSizeImg = (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);
    next()
};

// filltering object function created here
const objectFilter = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//users routes handles here

exports.updateMe = asyncCatch(async (req, res, next) => {
  // 1. create error if user POST password data
  if (req.body?.password || req.body?.passwordConfirm)
    return next(
      new AppError(
        'password should not input here kindly navigate to password update section',
        401,
      ),
    );
  // 2. update user document
  let filteredBody = objectFilter(req.body, 'name', 'email');
  if (req.file) {
    filteredBody.photo = req.file.filename;
    console.log(
      '$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$%%%%%%%%%%%%%%%%%%%%%',
      filteredBody,
    );
  }
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: 'success',
    messege: 'your inseide update user route',
    user: updatedUser,
  });
});
exports.deleteMe = asyncCatch(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).send();
});

exports.getMe = (req, res, next) => {
  console.log(req.user + '////////////**************////////////');

  req.params.id = req.user.id;
  next();
};
// please dont use this for password update we auth controller for that
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getSpecificUser = factory.getone(User);
exports.getAllUsers = factory.getAll(User);
