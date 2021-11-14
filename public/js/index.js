import '@babel/polyfill';
import {login,logout} from './login';
import {displayMap} from './mapbox';
import {updateSettings} from './updateSetting';
import {bookTour} from './stripe';


// DOM elements
const mapBox        = document.getElementById('map');
const loginForm     = document.querySelector('.form--login');
const updateForm    = document.querySelector('.form-user-data');
const updatePassword= document.querySelector('.form-user-settings') 
const logoutBtn     = document.querySelector('.nav__el--logout')
const bookBtn       = document.querySelector('#book-tour')

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
        //FORMDATA PARA LEER Y ENVIAR ARCHIVOS AL SERVIDOR, TAMBIEN PARA NO ARCHIVOS
        const data = new FormData()
        //CON APPEND AGREGAMOS LOS ELEMENTOS EN CLAVE/VALOR COMO UN JSON PERO AQUI
        //PODEMOS LEER ARCHIVOS
        data.append('name',document.getElementById('name').value)
        data.append('email',document.getElementById('email').value)
        data.append('photo',document.getElementById('photo').files[0])

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
            passwordNew : newPassword,
            passwordNewConfirmed : newPasswordConfirm
        }
        await updateSettings(data,'password');
        document.getElementById('password-current').value  =
        document.getElementById('password').value = 
        document.getElementById('password-confirm').value = ''

        document.querySelector('.btn--update--password').innerHTML = 'Save Password'
    })
}
if(bookTour){
    bookBtn.addEventListener('click',e=>{
        e.target.textContent = 'Processing...'
        const {tourId} = e.target.dataset
        bookTour(tourId)
    })
}