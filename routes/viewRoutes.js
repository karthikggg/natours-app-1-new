const express = require('express');
const router = express.Router();
const { overview, tour ,getTour , loginPage , accountPage ,submitUserData, getMyTours, signInPage} = require('../controllers/viewController');
const {protectPage ,protectRoute} = require('../controllers/authcontroller')
const {checkoutSession, createBookingCheckout} = require('../controllers/boookingContoller')
router.use(protectPage)

router.get('/', protectPage ,overview);
router.get('/tour/:slug' , getTour)
router.get('/login' , loginPage)
router.get('/signin' , signInPage)
router.get('/me' ,protectRoute, accountPage)

router.get('/my-tours' , createBookingCheckout, protectRoute  ,getMyTours)

router.post('/submit-user-data' ,protectRoute, submitUserData)

module.exports = router;
