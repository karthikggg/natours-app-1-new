const express = require('express');

const { protectRoute, restrictTo } = require('../controllers/authcontroller');

const {
  getAllReview,
  createReview,
  deleteReview,
  updateReview,
  setUserIDandTourID,
  getSpecificReview,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });
router.use(protectRoute);

router
  .route('/')
  .get(getAllReview)
  .post(protectRoute, restrictTo('user'), setUserIDandTourID, createReview);

router
  .route('/:id')
  .delete(protectRoute, restrictTo('admin', 'user'), deleteReview)
  .patch(protectRoute, restrictTo('admin', 'user'), updateReview)
  .get(protectRoute, restrictTo('admin', 'user') ,getSpecificReview);

module.exports = router;
