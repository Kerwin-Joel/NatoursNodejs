const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require('./../utils/apiFeatures')


exports.deleteOne = Model => {
    return catchAsync(async(req, res, next) => {
        // req.body el body estará lleno de data cuando se le haya pasado data en el postman
        // console.log(req.body);
        
        //El status 204 no devuelve nada de data
        const docu = await Model.findByIdAndDelete(req.params.id)
        if (!docu) {      
            return next(new AppError('No document found with that ID', 404));
        }
    
        res.status(204).send({
            status: `${Model} delete`,
            data: {
                docu
            }
        });
    })
}

exports.updateOne = Model =>{
    return catchAsync(async (req, res, next) => {
        const docu = await Model.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators: true
        })
    
        if(!docu) {
            return next(new AppError('Not document found with that id',404));
        }
    
        res.status(200).send({ 
            status: 'success', 
            data:{
                data:docu
            }
        })
    })
}

exports.createOne = Model =>{
    return catchAsync(async (req, res, next) => {
        //req.body el body estará lleno de data cuando se le haya pasado data en el postman
        const docu = await Model.create(req.body)
        res.status(201).send({
            status: 'success',
            data: {
                data: docu
            }
        })
    })
}

exports.getOne    = (Model,populations) =>{
    return catchAsync(async(req, res, next) => {
        //req.params nos permite convertir los parametros en objetos
        let query = await Model.findById(req.params.id)
        if(populations) query = await Model.findById(req.params.id).populate(populations)
        const docu = query
    
        if(!docu) return next(new AppError('Not document found with that id',404));
    
        res.status(200).json({
            status  : 'success',
            data    : {
                data:docu
            }
        })
    })
} 

exports.getAll    = Model => {

    return catchAsync(async (req, res, next) => {
        //TO ALLOW FOR NESTED GET REVIEWS ON TOUR
        let filter = {}//only work in reviewController
        if(req.params.tourId) filter = {tour:req.params.tourId}
        /*el callback es lo que queremos qeu haga cuando
        se solicite el metodo get con esa url
        req => lo que el navegador envia al servidor
        res => lo que nosotros respondemos al nevegador*/
                                 //queryMoongose, obj url params
        const feature = new APIFeatures(Model.find(filter),req.query)
                .filter()
                .sorting()
                .fieldLimit()
                .pagination()
                
        //hacer consulta
        // const docu = await feature.query.explain(); // In MongoDB, the explain command tells the MongoDB server to return stats about how it executed a query
        const docu = await feature.query; // Execute query
    
        res.status(200).send({
            status: 'success',
            result: docu.length,
            data: {
                data:docu
            }
        })
    })
}