
const hiddeAlert = () => {
    const alert = document.querySelector('.alert');
    if (alert) {
        alert.style.display = 'none';
    }
}


//type is 'success' or 'error'
export const showAlert = ( type, message ) => {
    const markup = `<div class="alert alert--${type}"> ${message} </div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
    setTimeout(() => {
        hiddeAlert();
    },4000)
}