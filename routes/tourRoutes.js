const express = require('express');
const reviewRouter = require('./reviewRoutes');

const {
  getAllTours,
  createTours,
  getSpecificTour,
  updateTour,
  deleteTour,
  getTourStat,
  getMontlyMostTour,
  testMiddleware,
  toursWithin,
  uploadTourPhoto,
  tourImageResize
} = require('../controllers/tourController');

const { protectRoute, restrictTo } = require('../controllers/authcontroller');

//tour router
//routes handled using middleware for seprate files
const router = express.Router();

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
router.use('/:tourId/reviews', reviewRouter);

//router.param middleware funtion
//router.param("id" ,checkID)
router.route('/montly-plan/:id').get(getMontlyMostTour);
router.route('/top-5-best').get(testMiddleware, getAllTours);
router.route('/tourstats').get(getTourStat);

router
  .route('/')
  .get(getAllTours)
  .post(protectRoute, restrictTo('admin', 'guide-lead'), createTours);
router
  .route('/:id')
  .get(getSpecificTour)
  .patch(protectRoute, restrictTo('admin', 'guide-lead'), uploadTourPhoto,tourImageResize , updateTour)
  .delete(protectRoute, restrictTo('admin', 'guide-lead'), deleteTour);

router
  .route('/distance-within/center/:distance/:latlong/:unit')
  .get(toursWithin);

module.exports = router;
