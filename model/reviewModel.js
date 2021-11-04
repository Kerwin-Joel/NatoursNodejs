const mongoose  = require('mongoose');
const Tour      = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    
    review:{
        type        : String,
        required    : [true,'Review can not be empty']
    },
    rating:{
        type        : Number,
        min         : 1,      
        max         : 5      
    },
    createdAt:{
        type        : Date,
        default     : Date.now,
        required    : true
    },
    tour:{
        type        : mongoose.Schema.ObjectId,
        ref         : 'Tour',
        required    : [true, 'Review must belong to a tour'],
    },
    user:{
        type        : mongoose.Schema.ObjectId,
        ref         : 'User',
        required    : [true, 'Review must belong to a user'],
    }
},
{
    toJSON      : { virtuals : true },
    toObject    : { virtuals : true }
})

// este index es para poder evitar que el review tenga duplicados
reviewSchema.index({ tour : 1, user : 1 },{ unique : true })

reviewSchema.pre(/^find/,function(next){ //with regex
    // this.populate({
    //     path:'tour',
    //     select:'name' 
    // })
    // .populate({
    //     path:'user',
    //     select:'name photo' 
    // })
    
    this.populate({
        path:'user',
        select:'name photo' 
    })
    next()
})


reviewSchema.statics.calcAverageRatings = async function(tourId) {
    //calculate average
    // console.log(tourId);
    // console.log('holas');
    const stats = await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum: 1},
                avgRating:{$avg:'$rating'}
            }
        }
    ])
    console.log(stats);
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity : stats[0].nRating, 
            ratingsAverage  : stats[0].avgRating 
        })
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity : 0, 
            ratingsAverage  : 4.5 
        })
    }
}

reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour);
});

// volver a calcular el promedio cuando se actualiza un review
reviewSchema.pre(/^findOneAnd/, async function(next) {
    // este middleware se ejecuta cuando hacemos un update o delete de un middleware, 
    // hasta este punto solo tenemos un query, aun no tenemos un objeto, asi que solo
    // se ejecuta el query para poder llenar al this con la data del review,
    // esto sucede en el pre, en el post lo continuaremos
    this.requestQuery = await this.findOne()
    next()
});
reviewSchema.post(/^findOneAnd/, async function() {
    // una vez ejecutado el query en el pre, el this se llena con el resultado de ese middleware
    // es decir que ya tenemos que review es el que se esta actualizando o eliminando, aqui lo manejaremos.
    // En este punto ya podemos acceder y ejecutar metodos que hicimos en el modelo y aqui ejecutaremos el
    // metodo calcAverageRatings para volver a calcular el promedio en base a la review actualizada
    // Aqui ya tenemos un objeto con data y propiedades y al metodo le pasamos el id del tour para que 
    // el metodo pueda actualizar el promedio y el numero de reviews 
    this.requestQuery.constructor.calcAverageRatings(this.requestQuery.tour)
});

const Review =  mongoose.model('Review',reviewSchema)



module.exports = Review