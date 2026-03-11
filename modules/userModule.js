const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const asyncCatch = require('../utils/asyncCatch');

//name , email, photo , password , passwordConfirm ,

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'user must have a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'user must have a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedTimeAt: Date,
  passwordToken: String,
  passwordTokenExpiration: Date,
  active: {
    default: true,
    type: Boolean,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //only run this function if password was actually modified while creat or update
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified || this.isNew) return next();

  this.passwordChangedTimeAt = Date.now() + 1000;
});
userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check if the user changed password and using the token which created using old password
userSchema.methods.tokenUsageAfterChangedPassword = async function (
  jwtTimeStamp,
) {
  if (this.passwordChangedTimeAt) {
    const convertedpasswordChangedTimeAt =
      parseInt(
      this.passwordChangedTimeAt.getTime() / 1000,
      10)

    //  if(jwtTimeStamp > convertedpasswordChangedTimeAt ){
    //   return next( new AppError("your using old token please login again" , 401))
    //  }
    return jwtTimeStamp < convertedpasswordChangedTimeAt;
  }
  return false;
};

// forgot password instance function it will create crypto token and retrun but saves encrypted version in db
userSchema.methods.forgotPasswordTokenProvider = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // resettoken hold unencrypted version
  this.passwordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // here modifies passwordToken in db with encrypted version for saftey note:only modifies not saved

  this.passwordTokenExpiration = Date.now() + 10 * 60 * 1000;
  // here modifies passwordTokenExpiration with current time which this functions caLLSTIME

  return resetToken;
  // returns unencripted token
};

const User = mongoose.model('user', userSchema);

module.exports = User;
