const Tours = require('../modules/tourModule');
const Booking = require('../modules/bookingModule')
const Review = require('../modules/reviewModule');
const asyncCatch = require('../utils/asyncCatch');
const AppError = require('../utils/appError');
const User = require('../modules/userModule')


exports.overview = asyncCatch(async (req, res, next) => {
  const tours = await Tours.find();

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = asyncCatch(async (req, res, next) => {
  const tour = await Tours.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review user rating -tour -_id',
  });

  if(!tour) return next(new AppError(`there is no tour with this name    ${req.params.slug} ` , 404))

  res.status(200).render('tour', {
    tour,
  });
});

exports.loginPage = (req, res , next) =>{
  res.status(200).render('login')
}


exports.accountPage = (req, res , next) =>{
  res.status(200).render('account')
  console.log("account page");
  
}

exports.submitUserData = async (req , res , next) =>{
  console.log(req.body.email + 'heloooooooooooooooo from submited data');
  const updatedUser =await User.findByIdAndUpdate(req.user.id , {
    name : req.body.name,
    email : req.body.email
  })
  res.status(200).render('account' , {
    title : 'your account',
    user : updatedUser
  })
  
  

}

exports.getMyTours = async (req, res, next) =>{
  const tours = await Booking.find({user:req.user._id})
  const t = tours.map((m)=>m.tour)
  
  
  res.status(200).render('overview' , {
    title: 'my-tours',
    tours : t
  })
  
}