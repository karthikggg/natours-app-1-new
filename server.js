const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });



const app = require('./app');
const mongoose = require('mongoose');

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




/*const testtour = new Tours({
  name : "The winter Hiker",
  price : 954,
  rating:4.9
})

testtour.save().then((doc)=>{
  console.log(doc);
  
})
  */

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`App running on port 3000...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

