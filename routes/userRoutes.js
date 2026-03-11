const express = require('express');
const {
  getAllUsers,
  updateUser,
  updateMe,
  createUser,
  deleteMe,
  deleteUser,
  getSpecificUser,
  getMe,uploadUserPhoto,reSizeImg
} = require('../controllers/userController');
const {
  signUp,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protectRoute,
  restrictTo,
  logout,
} = require('../controllers/authcontroller');

//userRoutes
const router = express.Router();
router.post('/signup', signUp);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protectRoute);
router.patch('/updateMyPassword', updatePassword)
router.patch('/updateMe', uploadUserPhoto ,reSizeImg,updateMe);
router.delete('/deleteMe', deleteMe);
router.get('/getme', getMe, getSpecificUser);


router.use(restrictTo('admin'));
router.route('/').get(getAllUsers).post(getAllUsers)
router.route('/:id').get(getSpecificUser).patch(updateUser).delete(deleteUser)


// route
//     .route('/:id')
//     .patch(updateUser)
//     .delete(deleteUser)

module.exports = router;
