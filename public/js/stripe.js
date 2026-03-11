import { showAlert } from './alert';
// Create a Stripe instance with your publishable key
const stripe = Stripe('pk_test_51SyK0rHRCedXJIghipuMx7sQZsbsUuojXprkKQEnLZNCnA0KEvazCmH8JvAsogb7LIOZqXdlw0WVP2AYq7OZ8bdy00agOEkbfA');

export const bookTour = async (tourID) => {
  try {
    // 1. get checkout session
    const session = await axios(`http://127.0.0.1:3000/api/v1/booking/checkoutSession/${tourID}`);
    console.log(session);

    // 2. create checkout from Endpoing + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
