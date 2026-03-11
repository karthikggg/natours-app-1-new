const asyncCatch = require('../utils/asyncCatch');
const Tour = require('../modules/tourModule');
const stripe = require('stripe')(process.env.STRIPE_SECRET_ID);
const User = require('../modules/userModule')
const Booking = require('../modules/bookingModule')


exports.checkoutSession = asyncCatch(async (req, res, next) => {
  // 1.get currently booking tour
  const tour = await Tour.findById(req.params.tourID);
  console.log( tour+  '$$$$$$$$#######################');
  
  // 2. create a booking session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
      line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // Amount in cents
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          }
        },
        quantity: 1
      }
    ],
    mode: 'payment'
  
  });

  // 3. create session as response
  res.status(200).json({
    status:'success',
    session
  })
});

exports.createBookingCheckout = asyncCatch(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});
