import {showAlert} from './alert'

export const loginFuction = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/user/login',
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
    showAlert('error','password or email is incorrecttttt😮');
  }
};



export const logoutFuction = async ()=>{
    try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/user/logout',
    });
    if (res.data.status == 'success') {
      showAlert('success' , 'logged out in succesfully')
      window.location.assign('/');
    }
  } catch (error) {
    console.log('ERROR STACK:', error.response?.data);
    
  }
};
  
