const Tour         = require('../model/tourModel')
const AppError     = require('../utils/appError')
const catchAsync   = require('../utils/catchAsync')
const factory      = require('./handleFactory')
const sharp        = require('sharp')
const multer       = require('multer')

//---------CALLBACKS TO ENDPOINTS
//FUNCTIONES TO TOURS (CONTROLLERS)

//FUNCTION TO UPLOAD PHOTOS
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) =>{
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }
}
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadTourImages = upload.fields([
    {name: 'imageCover' , maxCount: 1},
    {name: 'images'     , maxCount: 3},
])

exports.resizeTourImages = catchAsync( async(req, res, next) => {

    if(!req.files.imageCover || !req.files.images){
        return next()
    }

    // 1) Cover Image
    await sharp(req.files.imageCover[0].buffer)
        .resize(500,500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${req.body.imageCover}`)

    //2) Images
    req.body.images = []
    await Promise.all(// USAMOS PROMISES.ALL PARA EJECUTAR TODAS LOS ASINCRONOS DE SHARP
        req.files.images.map( async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
            await sharp(req.files.images[i].buffer)
                .resize(2000,1333)
                .toFormat('jpeg')
                .jpeg({quality: 90})
                .toFile(`public/img/tours/${filename}`)

            req.body.images.push(filename)
        })
    )
    console.log()
    next()
})



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
exports.getAllTours = factory.getAll(Tour)
//GETTOURBYID
exports.getTourById = factory.getOne(Tour,{path:'reviews'})
//POST
exports.postTour    = factory.createOne(Tour)
//PATCHTOUR
exports.patchTour   = factory.updateOne(Tour)
//DELETETOUR
exports.deleteTour  = factory.deleteOne(Tour)
/* exports.deleteTour = catchAsync(async(req, res, next) => {
    req.body el body estará lleno de data cuando se le haya pasado data en el postman
    console.log(req.body);
    
    El status 204 no devuelve nada de data
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
}) */

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

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/2345/center/34.4343,23.341187/unit/mi
exports.getTourWithin = catchAsync(async (req, res, next) => {

    const { distance, latlng, unit } = req.params
    const [lat,lng] = latlng.split(',')
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1 

    if(!lat || !lng) return new AppError('Please provide latitud and longitude in the format lat,lng',400)

    const tours =  await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng,lat],radius] } }
    })

    res.status(200).json({
        status  : 'succes',
        results:tours.length,
        data:{
            data:tours
        }
    })
})
exports.getDistances = catchAsync(async (req, res, next) => {

    const { latlng, unit } = req.params
    const [lat,lng] = latlng.split(',')

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001

    if(!lat || !lng) return new AppError('Please provide latitud and longitude in the format lat,lng',400)

    const distances = await Tour.aggregate([
        {
            $geoNear:{
                near:{
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField:'distance',
                distanceMultiplier:multiplier,
            }
        },
        {
            $project:{
                distance:1,
                name:1
            }
        }
    ])
    res.status(200).json({
        status  : 'succes',
        data:{
            data:distances
        }
    })

})


/* exports.getAllTours = catchAsync(async (req, res, next) => {
    /*el callback es lo que queremos qeu haga cuando
    se solicite el metodo get con esa url
    req => lo que el navegador envia al servidor
    res => lo que nosotros respondemos al nevegador
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
}) */

