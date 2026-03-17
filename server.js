// Load local env file only in non-production environments.
// In production (Railway) env vars should be set via the platform UI.
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  dotenv.config({ path: './config.env' });
}

const app = require('./app');
const mongoose = require('mongoose');

// Prefer DATABASE_URL (Atlas) and fall back to local for dev
const MONGODB_URI = process.env.DATABASE_URL || process.env.DATABASE_LOCAL;

mongoose
  .connect(MONGODB_URI, {
    // options left for backwards compatibility; mongoose will ignore unknown ones
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then(() => {
    console.log('successful mongo db connection');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    // Exit process if DB connection fails (makes failure explicit in logs)
    process.exit(1);
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

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

