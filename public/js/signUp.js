import { showAlert } from './alert';

export const signUpFunction = async (name, email, password, passwordConfirm) => {
  try {
    console.log('Starting signup with:', { name, email });
    console.log('Sending axios request...');
    
    const res = await axios({
      method: 'POST',
      url: '/api/v1/user/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
      withCredentials: true // ✅ IMPORTANT: Include cookies!
    });
    
    
    if (res.data.status === 'success') {
      console.log('✅ Success condition met! Redirecting...');
      showAlert('success', 'Account created successfully! Logging you in...');
      window.setTimeout(() => {
        console.log('About to redirect to /');
        window.location.assign('/');
      }, 1500);
    } else {
      console.log('❌ Status is not success:', res.data.status);
      showAlert('error', `Unexpected response: ${res.data.status}`);
    }
  } catch (error) {
    console.log('❌ CAUGHT ERROR');
    console.error('Error object:', error);
    console.log('ERROR STACK:', error.response?.data);
    console.log('Full error:', error);
    const serverMsg = error.response?.data?.message || error.message || 'Unknown error';
    showAlert('error', `Sign up failed: ${serverMsg}`);
  }
};