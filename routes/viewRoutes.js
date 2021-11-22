const express        = require('express');
const router         = express.Router()
const viewController = require('../controllers/viewController')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')


router.get('/',authController.isLoggedIn,viewController.getOverview) 
router.use(authController.isLoggedIn)
router.get('/tour/:slug',authController.protected,  viewController.getTour)
router.get('/login',authController.isLoggedIn, viewController.getLoginForm)
router.get('/me',authController.protected ,viewController.getAccount)
router.get('/my-tours',authController.protected ,viewController.getMyTours)

//Esta ruta esta especialmente para poder hacer un post mediante un formulario de html
//sin Javascript 
router.post('/submit-user-data',authController.protected,viewController.updateUserData)

module.exports = router
