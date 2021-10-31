const Tour = require('../model/tourModel')
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
//---------CALLBACKS TO ENDPOINTS
//FUNCTIONES TO TOURS (CONTROLLERS)

//TOP 5 TOURS
exports.aliasTopTour = async (req, res, next) => {
    //llenamos el query string para obtener los 5 tours baratos
    req.query.limit = '5'
    req.query.sort = '-ratingAverage.price'
    req.query.fields = 'name,price,ratingAverage,summary,difficulty'
    next()
    //este metodo se ejecutara antes del metodo getAllTours
}


//GETALLTOURS
exports.getAllTours = catchAsync(async (req, res, next) => {
    /*el callback es lo que queremos qeu haga cuando
    se solicite el metodo get con esa url
    req => lo que el navegador envia al servidor
    res => lo que nosotros respondemos al nevegador*/
                             //queryMoongose, obj url params
    const feature = new APIFeatures(Tour.find(),req.query)
            .filter()
            .sorting()
            .fieldLimit()
            .pagination()
    
    //hacer consulta
    const tours = await feature.query; // Execute query

    res.status(200).send({
        status: 'success',
        result: tours.length,
        data: {
            tours
        }
    })
})
//GETTOURBYID
exports.getTourById = catchAsync(async(req, res, next) => {
    //req.params nos permite convertir los parametros en objetos
    const tour = await Tour.findById(req.params.id)

    if(!tour) {
        return next(new AppError('Not tour found with that id',404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
})

//POST
exports.postTour = catchAsync(async (req, res, next) => {
    //req.body el body estará lleno de data cuando se le haya pasado data en el postman
    const newTour = await Tour.create(req.body)
    res.status(201).send({
        status: 'success',
        data: {
            tour: newTour
        }
    })
})
//PATCHTOUR
exports.patchTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators: true
    })

    if(!tour) {
        return next(new AppError('Not tour found with that id',404));
    }

    res.status(200).send({ 
        status: 'success', 
        data:{
            tour
        }
    })
})
//DELETETOUR
exports.deleteTour = catchAsync(async(req, res, next) => {
    // req.body el body estará lleno de data cuando se le haya pasado data en el postman
    // console.log(req.body);
    
    //El status 204 no devuelve nada de data
    const tour = await Tour.findByIdAndDelete(req.params.id)

    if(!tour) {
        return next(new AppError('Not tour found with that id',404));
    }

    res.status(200).send({
        status: 'tour delete',
        data: {
            tour
        }
    });
})
//pipeline matching and grouping
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        { 
            $match: { ratingsAverage: { $gte: 4.5 } } //como primer filtro desde moondodb
        },
        { 
            $group:{
                _id:{$toUpper: '$difficulty'},
                numTours:{$sum:1},
                numRating:{$sum:'$ratingsQuantity'},
                avgRating:{$avg:'$ratingsAverage'},
                avgPrice:{$avg:'$price'},
                minPrice:{$min:'$price'},
                maxPrice:{$max:'$price'}
            }
        },
        {
            $sort:{avgPrice:-1}// ordenar de forma ascendete, -1 para descendente
        }
    ])
    res.status(200).send({
        status: 'succes',
        data: {
            stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; // 2021

    const plan = await Tour.aggregate([
        {   //operator // campo propio
            $unwind:'$startDates' //separa tours por fechas de viaje
        },
        {
            $match:{//operator from moongose

                startDates:{//field of mongodb
                                    //anio mes dia
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group:{
                _id:{$month:'$startDates'},
                numTourStars: { $sum: 1 },
                tours:{ $push: '$name'},
            }
        },
        {
            $addFields: {
                month: {
                    $let: {
                        vars: {
                            monthsInString: [, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                        },
                        in: {
                            $arrayElemAt: ['$$monthsInString', '$_id']
                        }
                    }
                }
            }
        },
    ])
    res.status(200).send({
        status: `tours in ${year}`,
        data: {
            plan
        }
    });
})