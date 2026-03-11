const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../modules/tourModule');
const Review = require('../../modules/reviewModule');
const User = require('../../modules/userModule');

const fs = require('fs');
const { json } = require('stream/consumers');
const { userInfo } = require('os');

dotenv.config({ path: '../../config.env' });
const MONGODB_URI = process.env.DATABASE_URL;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then(() => {
    console.log('successfull mongo db connections');
  });

const sampleTours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
const sampleUsers = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
const sampleReviews = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));

const importData = async () => {
  try {
    await Tour.create(sampleTours);
    await User.create(sampleUsers ,  { validateBeforeSave: false });
    await Review.create(sampleReviews);

    console.log('data successfully created');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteTour = async () => {
  try {
    await Tour.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});

    console.log('data successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

console.log(process.argv);
if (process.argv[2] == '--import') {
  importData();
}
if (process.argv[2] == '--delete') {
  deleteTour();
}
console.log(process.argv[2]);
