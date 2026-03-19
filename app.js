const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');
const cookiesParser = require('cookie-parser')

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewrouter = require('./routes/viewRoutes')
const bookingRouter = require('./routes/bookingRoute')
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use(cookiesParser())
app.use(express.urlencoded({extended:true}))
const express = require('express');


// ✅ CRITICAL: Trust Railway's proxy
app.set('trust proxy', 1);

// ... rest of your middleware
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// etc...

// Enable CORS for all origins (for development/production)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// In app.js, after setting views


app.set('query parser', 'extended');
//here is morgan which give detail info about req
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers


// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize({
//   replaceWith: '_'
// }));

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//all tours imported here

//custom middleware fuctions writtern here
// app.use((req, res, next) => {
//   req.a = new Date();

//   console.log('helo from the middleware' + req.url);

//   next();
// });

//all routs callbacks written here
//tours routs callbacks handles here

//all routes written here
//tour router
//routes handled using middleware for seprate files

//userRoutes


app.use('/' , viewrouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/booking' , bookingRouter)

/*app.get('/' , (req , res)=>{
    res.send("here we have get request reply")

})*/

// 1st step of error handling if any routes given instead of handled which is above below middleware fuction trows error
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

//server start here
