const Review = require('../modules/reviewModule');
const asyncCatch = require('../utils/asyncCatch');
const factory = require('./handleFactory');

exports.getAllReview = asyncCatch(async (req, res) => {
  let filter;
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const review = await Review.find(filter);
  res.status(201).json({
    status: 'success',
    messege: ' your inside get all review route',
    review,
  });
});

exports.setUserIDandTourID = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next()
};

// exports.createReview = asyncCatch(async (req, res) => {
//   const review = await Review.create({
//     review: req.body.review,
//     rating: req.body.rating,
//     createdAt: req.body.createdAt,
//     tour: req.body.tour,
//     user: req.body.user,
//   });

//   res.status(201).json({
//     status: 'success',
//     review: review,
//   });
// });
exports.createReview = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getSpecificReview = factory.getone(Review)
