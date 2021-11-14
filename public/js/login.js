import axios from 'axios'
import {showAlert} from './alerts'
export const login = async(email, password) =>{
    try {
        const response = await axios({
            method: 'post',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        if(response.data.status === 'success'){
            showAlert('success','Logged in successfully')
            window.setTimeout(function(){
                location.assign('/')
            },1500)
        }
    } catch (error) {
        showAlert('error','Incorrect password or email')
    }
}

export const logout = async() =>{
    try {
        const response = await axios({
            method: 'get',
            url: '/api/v1/users/logout',
        })
        if(response.data.status === 'success'){
            setTimeout(function(){
                showAlert('success','Logged out successfully')
                location.assign('/')
            },1500)
        }
    } catch (error) {
        showAlert('error','Something went wrong')
    }
}



// document.querySelector('.form').addEventListener('submit',e=>{
//     e.preventDefault();
//     const email = document.getElementById('email').value
//     const password = document.getElementById('password').value
//     login(email,password)
// })


// loulou@example.com