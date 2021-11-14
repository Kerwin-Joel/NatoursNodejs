const express = require('express');
const tourRouter = express.Router();
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRoutes = require('../routes/reviewRoutes')

//Existe un middleware que se ejecuta cuando la url coincide con la ruta
tourRouter.param('id',(req,res, next,val)=>{
    //cuando hacemos un request a /api/v1/tours/:id y pasamos el valor del 
    //parametro ese es capturado y se ejecutara lo que definamos en este
    //callback
    console.log(`valor del id: ${val}`)
    next()
    // Este es un middleware que se ejecuta cuando tengamos una url que coincida,
    //solo asi se ejecutará
    //Estos middleware paramas los puedes usar para poder refactorizar codigo
    // cuando tengas parametros y funciones iguales
})

tourRouter.use('/:tourId/reviews',reviewRoutes)

tourRouter
    .route('/tour-stats')
    .get(tourController.getTourStats)

tourRouter
    .route('/monthly-plan/:year')
    .get(authController.protected, authController.restricTo('admin','lead-guide','guide'),tourController.getMonthlyPlan)

tourRouter
    .route('/top-5-cheap')
    .get(tourController.aliasTopTour,tourController.getAllTours)

tourRouter
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getTourWithin)
tourRouter
    .route('/distances/:latlng/unit/:unit')
    .get(tourController.getDistances)


tourRouter
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protected, authController.restricTo('admin', 'lead-guide'),tourController.postTour)

tourRouter
    .route('/:id')
    .get(tourController.getTourById)
    .patch(
        authController.protected, 
        authController.restricTo('admin','lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.patchTour)
    .delete(authController.protected, authController.restricTo('admin','lead-guide'), tourController.deleteTour)


// tourRouter
//     .route('/:tourId/reviews')
//     .post(
//         authController.protected,
//         authController.restricTo('user'),
//         reviewController.createReview
//         )


module.exports = tourRouter;