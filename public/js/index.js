import '@babel/polyfill';
import {login,logout} from './login';
import {displayMap} from './mapbox';
import {updateSettings} from './updateSetting';


// DOM elements
const mapBox        = document.getElementById('map');
const loginForm     = document.querySelector('.form--login');
const updateForm    = document.querySelector('.form-user-data');
const updatePassword= document.querySelector('.form-user-settings') 
const logoutBtn     = document.querySelector('.nav__el--logout') 
// DELEGATIONS
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}
if(loginForm){
    loginForm.addEventListener('submit',e=>{
        e.preventDefault();
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email,password)
    })
}
if(logoutBtn){
    logoutBtn.addEventListener('click', e=>{
        logout()
    })
}
if(updateForm){
    updateForm.addEventListener('submit', e=>{
        e.preventDefault()
        
        const data = {
            name    : document.getElementById('name').value,
            email   : document.getElementById('email').value
        }
        updateSettings(data,'data')
    })
}
if(updatePassword){
    updatePassword.addEventListener('submit', async e=>{
        e.preventDefault()
        
        document.querySelector('.btn--update--password').innerHTML = 'Updating ...'
        const currentPassword = document.getElementById('password-current').value
        const newPassword = document.getElementById('password').value
        const newPasswordConfirm = document.getElementById('password-confirm').value
        const data = {
            passwordCurrent : currentPassword,
            password : newPassword,
            passwordConfirm : newPasswordConfirm
        }
        await updateSettings(data,'password');
        document.getElementById('password-current').value  =
        document.getElementById('password').value = 
        document.getElementById('password-confirm').value = ''

        document.querySelector('.btn--update--password').innerHTML = 'Save Password'
    })
}