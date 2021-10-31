const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController')
//exportamos el modulo Router de express para generar un sistema de multirutas




//ENDPOINTS TO USERS
userRouter
    .route('/api/v1/users')
    .get(userController.getAllUsers)
    .post(userController.postUser)

userRouter
    .route('/api/v1/users/:id')
    .get(userController.getUserById)
    .patch(userController.patchUser)
    .delete(userController.deleteUser)

module.exports = userRouter