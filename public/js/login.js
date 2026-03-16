import {showAlert} from './alert'

export const loginFuction = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/user/login',
      data: {
        email,
        password,
      },
    });
    if (res.data.status == 'success') {
      showAlert('success' , 'logged in succesfully')
      window.location.assign('/');
    }
  } catch (error) {
    console.log('ERROR STACK:', error.response?.data);
    console.log('Full error:', error);
    const serverMsg = error.response?.data?.message || error.message || 'Unknown error';
    showAlert('error', `Login failed: ${serverMsg}`);
  }
};



export const logoutFuction = async ()=>{
    try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/user/logout',
    });
    if (res.data.status == 'success') {
      showAlert('success' , 'logged out in succesfully')
      window.location.assign('/');
    }
  } catch (error) {
    console.log('ERROR STACK:', error.response?.data);
    
  }
};
  
