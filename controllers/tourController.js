const fs = require('fs');
const Tours = require('../modules/tourModule');
const app = require('../app');
const ApiFeatures = require('../utils/apiFeatures');
const { match } = require('assert');
const asyncCatch = require('../utils/asyncCatch');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');
const multer = require('multer');
const sharp = require('sharp');

//tours routs callbacks handles here
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

//id checking function aka middleware```
/*exports.checkID = ((req , res , next)=>{
     const tour = tours.find((el) => el.id == req.params.id * 1)
    if (!tour) {
        return (
            res.status(404).json({
                status: "failed",
                description: "tour not found with that id"
            })
        )
    }
    next()
})

exports.checkBody = ((req , res, next) =>{
    console.log(req.body);  
    if(!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('price') ){
        return res.status(404).json({
                status: "failed",
                description: "data not found"
            })
    }
    next()


})
    */

exports.testMiddleware = (req, res, next) => {
  console.log(req.user);

  req.url =
    '/?sort=-ratingsAverage,price&fields=ratingsAverage,price,name,difficulty,summary&limit=2';
  next();
};
{
  // qryString = qryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // //executing querry
  // let query = Tours.find(JSON.parse(qryString));
  //sorting------------------------------
  // if (req.query.sort) {
  //   let sortBy = req.query.sort;
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('-name');
  // }
  // //field limiting------------------
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v');
  // }
  //pagination querry---------------
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;
  // query = query.skip(skip).limit(limit);
  // if (req.query.page) {
  //   const numTours = await Tours.countDocuments();
  //   if (skip > numTours) {
  //     throw new Error('page has no documents');
  //   }
  // }
}

const storage = multer.memoryStorage();
const filterFile = (res, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage, filterFile });
exports.uploadTourPhoto = upload.fields([
  { name: 'images', maxCount: 3 },
  { name: 'imageCover', maxCount: 3 },
]);
exports.tourImageResize = async (req, res, next) => {
  console.log(req.files);
  if (!req.files.images || !req.files.imageCover) return next();
  // 1. image cover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //2. images 3 max
  req.body.images = []
  await Promise.all(req.files.images.map(async (f, i) => {
    fileName = `tour-${req.params.id}-${Date.now()}-${i+1}-cover.jpeg`;
    console.log('___filenmame>>' , fileName , req.body.images);
     sharp(f.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${fileName}`);
      
      req.body.images.push(fileName)
  })
)
  next();
};

// upload.array() for multiple file with same name
// upload.single() for single file with sigle name

//asyccatch for capture all error at global level
// try {

// } catch (error) {
//   res.status(404).json({
//     status: error,
//     messege: 'cant create tour',
//   });
// }
exports.getAllTours = factory.getAll(Tours);
exports.getSpecificTour = factory.getone(Tours);
exports.createTours = factory.createOne(Tours);
exports.updateTour = factory.updateOne(Tours);
exports.deleteTour = factory.deleteOne(Tours);

exports.getTourStat = asyncCatch(async (req, res) => {
  const stats = await Tours.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: null,
        duration: { $avg: '$duration' },
      },
    },
  ]);
  res.json({
    status: 'success',
    length: stats.length,
    data: { stats },
  });
});

exports.getMontlyMostTour = async (req, res) => {
  const year = req.params.id * 1;
  try {
    const montlyPlan = await Tours.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $addFields: {
          dateOnly: { $substr: ['$startDates', 0, 10] }, // "2021-04-25"
          parsedDate: {
            $dateFromString: {
              dateString: { $substr: ['$startDates', 0, 10] },
              format: '%Y-%m-%d',
            },
          },
        },
      },
      {
        $match: {
          parsedDate: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$parsedDate' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);
    res.json({
      status: 'success',
      length: montlyPlan.length,
      data: { montlyPlan },
      year: year,
    });
  } catch (error) {
    res.status(404).json({
      status: 'error',
      messege: error,
    });
  }
};
// '/distance-within/center/:distance/:latlong/:unit'

exports.toursWithin = async (req, res, next) => {
  const { distance, latlong, unit } = req.params;
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const [lat, lng] = latlong.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400,
      ),
    );
  }
  const tour = await Tours.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    distance,
    unit,
    latlong,
    radius,
    lenght: tour.length,
    tour,
  });
};
