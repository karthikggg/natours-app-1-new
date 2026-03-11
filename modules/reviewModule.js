const mongoose = require('mongoose');
const Tour = require('./tourModule');
// review / rating / createdAt /  ref to tour /  ref to user

const reviewShema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'review must be required'],
  },
  rating: {
    type: Number,
    max: 5,
    default: 4,
    required: [true, 'rating must be required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tours',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
  },
});
reviewShema.pre(/^find/, function (next) {
  this.populate('user');
  next();
});
// calculating average rating using aggregate pipeling and inject that into tour rating average and total review quantitiyh
reviewShema.statics.calcAverageRating = async function (tourId) {
  const stat = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        ratingAvg: { $avg: '$rating' },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stat[0].nRating,
    ratingsAverage: stat[0].ratingAvg,
  });
};
reviewShema.post('save', function () {
  this.constructor.calcAverageRating(this.tour);
});
reviewShema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.tour);
  }
});



// to restrict single user give multiple review for same tour
reviewShema.index({tour:1 , user:1} , {unique:true})
const Review = mongoose.model('Review', reviewShema);

module.exports = Review;
