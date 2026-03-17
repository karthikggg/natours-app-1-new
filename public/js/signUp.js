import { showAlert } from './alert';

export const signUpFunction = async (name, email, password, passwordConfirm) => {
  try {
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
    if (res.data.status === 'success') {
      showAlert('success', 'Account created successfully! Logging you in...');
      window.setTimeout(() => {
        window.location.assign('/');
      }, 1500);
    }
  } catch (error) {
    console.log('ERROR STACK:', error.response?.data);
    console.log('Full error:', error);
    const serverMsg = error.response?.data?.message || error.message || 'Unknown error';
    showAlert('error', `Sign up failed: ${serverMsg}`);
  }
};
