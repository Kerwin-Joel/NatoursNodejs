import axios from 'axios'
import { showAlert } from './alerts';

export const updateSettings = async(data,type)=> {
    const url = type === 'password' ? 
            'http://localhost:3000/api/v1/users/updatePassword' 
        : 
            'http://localhost:3000/api/v1/users/updateUserData'

    try {
        const response = await axios({
            method: 'PATCH',
            url,
            data:{
                passwordCurrent: data.passwordCurrent,
                passwordNew : data.password,
                passwordNewConfirmed:data.passwordConfirm
            }
        })
        if(response.data.status === 'success') {
            showAlert('success','Data update successfully')
        }
    } catch (error) {
        showAlert('error',error.response.data.message)
    }
}