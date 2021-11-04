const express           = require('express');
const reviewRouter      = express.Router( {mergeParams:true} );
const reviewController  = require('../controllers/reviewController')
const authController    = require('../controllers/authController')


reviewRouter.use(authController.protected)

reviewRouter
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restricTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview)
reviewRouter
    .route('/:id')
    .patch(authController.restricTo('user','admin'),reviewController.updateReview)
    .get(reviewController.getReview)
    .delete(authController.restricTo('user','admin'),reviewController.deleteReview)


module.exports = reviewRouter