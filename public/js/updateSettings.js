import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  const url =
    type === 'password'
      ? '/api/v1/user/updateMyPassword/'
      : '/api/v1/user/updateMe/';
  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status == 'success') {
      showAlert('success', 'data updated successfully');
      window.location.assign('/me');
    }
  } catch (error) {
    console.log('ERROR STACK:', error.response?.data);
    showAlert('error', error.response?.data.message);
  }
};
