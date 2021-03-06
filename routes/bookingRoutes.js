const express           = require('express');
const bookingController  = require('../controllers/bookingController')
const authController    = require('../controllers/authController')

const router = express.Router()

router.use(authController.protected)
router.get('/checkout-session/:tourId',bookingController.createBookingCheckouts,bookingController.getCheckoutSession)


router.use(authController.restricTo('admin','lead-guide'));

router.route('/')
        .get(bookingController.getAllBooking)
        .post(bookingController.createBooking)
router.route('/:id')
        .get(bookingController.getBooking)
        .patch(bookingController.updateBooking)
        .delete(bookingController.deleteBooking)


module.exports = router