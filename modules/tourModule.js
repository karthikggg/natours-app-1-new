const mongoose = require('mongoose');
const slug = require('slugify');
const validator = require('validator');
const Users = require('./userModule');
const User = require('./userModule');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name must required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [25, 'Username cannot exceed 15 characters'],
    },
    secretTours: {
      type: Boolean,
      default: 'false',
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, ''],
    },
    maxGroupSize: {
      type: Number,
      required: [true, ''],
    },
    difficulty: {
      type: String,
      required: [true, ''],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        messege: 'only easy  , meduim , difficult',
      },
    },
    price: {
      type: Number,
      //only applicable in new tour creation not in update cause only access the currently created doc which isthis has
      required: [true, 'price must reqired'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.7,
      max: [5, 'rating should not exceed 5'],
      min: [1, 'rating atleast should 1'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validate: function (val) {
        return val < this.price;
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: true,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// indexing should use to increace perfomance
tourSchema.index({ price:1 , ratingsAverage :1 });
tourSchema.index({slug :1})
tourSchema.index({startLocation : '2dsphere'})

//virtual properties its not savedin realy DB since its just a convertion cause simply done and
// not wasting db space best practice to completely seperate buisness logic and application logic
tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

// virtual populate
// Reviews – name of the virtual fiel
// Ref : name of the child module
// foreignField – ref child module that contain parents id in this case tour field in review module
// localfield – now foreignfield has id that id in tour with the fiel name of _Id
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//DOCUMENT MIDDLEWARE : can do operations on currently processed document
//below triggers only .save .create operation done
tourSchema.pre('save', function (next) {
  this.slug = slug(this.name, { lower: true });
  next();
});

//querry middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTours: { $eq: false } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedTimeAt',
  });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const tourGuides = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(tourGuides);

//   next();
// });
const Tours = mongoose.model('Tours', tourSchema);

module.exports = Tours;
