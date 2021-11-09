const express        = require('express');
const router         = express.Router()
const viewController = require('../controllers/viewController')
const authController = require('../controllers/authController')

router.use(authController.isLoggedIn)

router.get('/',authController.isLoggedIn, viewController.getOverview) 
router.get('/tour/:slug',authController.protected,  viewController.getTour)
router.get('/login',authController.isLoggedIn, viewController.getLoginForm)
router.get('/me',authController.protected ,viewController.getAccount)

//Esta ruta esta especialmente para poder hacer un post mediante un formulario de html
//sin Javascript 
router.post('/submit-user-data',authController.protected,viewController.updateUserData)

module.exports = router
