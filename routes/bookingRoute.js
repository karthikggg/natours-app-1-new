const express = require('express');

const { protectRoute, restrictTo } = require('../controllers/authcontroller');
const {checkoutSession} = require('../controllers/boookingContoller')

const router = express.Router();

router.get('/checkoutSession/:tourID' , 
    protectRoute,
    checkoutSession

)

module.exports = router;
