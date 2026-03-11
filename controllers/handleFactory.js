const { Model } = require('mongoose');
const AppError = require('../utils/appError');
const asyncCatch = require('../utils/asyncCatch');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  asyncCatch(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('no document found with given ID'));
    res.status(200).json({
      status: 'deleted successs',
      data: doc,
    });
  });

exports.updateOne = (Model) =>
  asyncCatch(async (req, res) => {
    
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = (Model) =>
  asyncCatch(async (req, res, next) => {
    const data = await Model.create(req.body);
    res.status(201).json({
      status: 'status',
      data: { data },
    });
  });

exports.getone = (Model) =>
  asyncCatch(async (req, res, next) => {
    //  const tour = tours.find((el) => el.id == req.params.id * 1)
    // if (!req.params.id.length !== 24) {
    //     return next(new AppError('Invalid ID format', 400));
    //   }
    const doc = await Model.findById(req.params.id).populate('reviews');

    if (!doc) {
      return next(
        new AppError('Tour not found with that id', 404, specificTour),
      );
    }
    res.json({
      status: 'success',
      data: { doc },
    });
  });

exports.getAll = (Model) =>
  asyncCatch(async (req, res) => {
    //execution----------------------
    let filter;
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const newApifeatures = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .field()
      .pagination();
    // const doc = await newApifeatures.query.explain();  
    const doc = await newApifeatures.query;

    res.json({
      status: 'success',
      results: doc.length + '  hereis the length',
      data: { Tours: doc },
    });
  });
