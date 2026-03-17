import { showAlert } from './alert';

export const signUpFunction = async (name, email, password, passwordConfirm) => {
  try {
    console.log('Starting signup with:', { name, email });
    const res = await axios({
      method: 'POST',
      url: '/api/v1/user/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    console.log('Full response:', res);
    console.log('Signup response data:', res.data);
    console.log('Status:', res.data.status);
    if (res.data.status === 'success') {
      console.log('✅ Success! Redirecting...');
      showAlert('success', 'Account created successfully! Logging you in...');
      window.setTimeout(() => {
        window.location.assign('/');
      }, 1500);
    } else {
      console.log('❌ Status is not success:', res.data.status);
    }
  } catch (error) {
    console.log('ERROR STACK:', error.response?.data);
    console.log('Full error:', error);
    const serverMsg = error.response?.data?.message || error.message || 'Unknown error';
    showAlert('error', `Sign up failed: ${serverMsg}`);
  }
};
