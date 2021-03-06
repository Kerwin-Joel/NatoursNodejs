const express           = require('express');
const authController    = require('../controllers/authController');
const userRouter        = express.Router(); //exportamos el modulo Router de express para generar un sistema de multirutas
const userController    = require('../controllers/userController')



//ENDPOINTS TO USER AUTHENTICATE
userRouter
    .route('/resetPassword/:token')
    .patch(authController.resetPassword)
userRouter
    .route('/forgotPassword')
    .post(authController.forwardPassword)
userRouter
    .route('/signup')
    .post(authController.signup);
userRouter
    .route('/login')
    .post(authController.login);
userRouter
    .route('/logout')
    .get(authController.logout);

    
userRouter.use(authController.protected)

userRouter
    .route('/updatePassword')
    .patch(authController.updatePassword)
userRouter
    .route('/updateUserData')
    .patch(
        userController.uploadUserPhoto,
        userController.resizeUserPhoto,
        userController.updateUserData) //This controller only update name and email and photo
userRouter
    .route('/deleteUser')
    .delete(userController.deleted)
userRouter
    .route('/me')
    .get(userController.getMe,userController.getUser)



userRouter.use(authController.restricTo('admin'))

//ENDPOINTS TO USERS LIKE A ADMIN
userRouter
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.postUser)
userRouter
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.patchUser)
    .delete(userController.deleteUser)

module.exports = userRouter