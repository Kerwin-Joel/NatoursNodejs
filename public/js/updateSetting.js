import axios from 'axios'
import { showAlert } from './alerts';

export const updateSettings = async(data,type)=> {
    console.log(type);
    const url = type === 'password' ? 
            'http://localhost:3000/api/v1/users/updatePassword' 
        : 
            'http://localhost:3000/api/v1/users/updateUserData'

    try {
        const response = await axios({
            method: 'PATCH',
            url,
            data
        })
        if(response.data.status === 'success') {
            showAlert('success','Data update successfully')
        }
    } catch (error) {
        showAlert('error',error.response.data.message)
    }
}