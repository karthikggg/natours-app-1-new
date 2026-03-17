console.log('hello from parcel');
import { loginFuction, logoutFuction } from './login';
import { signUpFunction } from './signUp';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe'
const loginForm = document.querySelector('.form--login');
const logout = document.querySelector('.nav__el--logout');
const updateSetting = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-password');
const booking = document.getElementById('book-tour')
const signin = document.querySelector('.form--signup')

if(signin){
  signin.addEventListener('submit' , (e)=>{
    e.preventDefault()
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signUpFunction(name, email, password, passwordConfirm);
  })
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginFuction(email, password);
  });
}

if (logout) {
  logout.addEventListener('click', () => {
    console.log('logout button clicked by');
    logoutFuction();
  });
}

if (updateSetting) {
  updateSetting.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });
}

if (updatePassword) {
  updatePassword.addEventListener('submit', async (e) => {
    e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';

    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    updateSettings({ password, newPassword, passwordConfirm }, 'password');

     document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}


if(booking){
  booking.addEventListener('click' , async (e) =>{
    
    console.log("clickedddddddddddddddddddddddddddddddd" + e.target.dataset.tourID);
      const { tourId } = e.target.dataset;
    bookTour(tourId)
  })
}