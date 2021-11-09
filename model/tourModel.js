const mongoose = require('mongoose')
const slugify = require('slugify')
// const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    //Este es un schema que actua como modelador de data
    name:{
        type        : String, 
        required    : [true,'A tour must have a name'] ,
        unique      : true,
        trim        : true,
        //data validation
        maxlength   : [40,'un tour debe tener menos o igual a 40 caracteres'],
        minlength   :[10,'un tour debe tener mas o igual a 10 caracteres'],
        // validate:[validator.isAlpha,'']
    },
    rating:{
        type    : Number, 
        default : 3.5
    },
    duration:{
        type        : Number, 
        required    : [true,'A tour must have a duration'] ,
    },
    maxGroupSize:{
        type    : Number, 
        required: [true,'A tour must have a group size'] ,
    },
    difficulty:{
        type    : String, 
        required: [true,'A tour must have a level difficulty'] ,
        // el enum solo funciona para string
        enum:{
            values  : ['easy','medium','difficult'],
            message : 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage:{
        type    : Number,
        default : 4.5,
        min     : [1,'el rating debe ser mayor a 1'],
        max     : [5,'el rating debe ser menor a 5'],
        set     : val => Math.round(val * 10) / 10
    },
    ratingsQuantity:{
        type    : Number,
        default : 0
    },
    price:{
        type    : Number,
        required: [true,'A tour must have a price']
    },
    priceDiscount:{
        type    : Number,
        validate:{
            //ESTE PUNTO ES SOLO PARA LA CREACION DE DOCUMENTOS MAS NO PARA ACTUALIZAR
            validator: function(val) {
                return val < this.price
            }
        },
        message :'el descuento ({VALUE}) no debe ser mayor al precio '
    },
    summary:{
        type    : String,
        trim    : true,
        required: [true,'A tour must have a summary']
    },
    description:{
        type    : String,
        trim    : true
    },
    imageCover:{
        type    : String,
        required: [true,'A tour must have a cover image']
    },
    images  : [String],
    createdAt:{
        type    : Date,
        default : Date.now()
    },
    startDates  : [Date],

    slug    : String,
    secretTour:{
        type    : Boolean,
        default : false
    },
    startLocation:{
        type:{
            type    : String,
            default : 'Point',
            enum    : ['Point']
        },
        coordinates : [Number],
        address     : String,
        description : String
    },
    locations:[
        {
            type:{ 
                type    : String,
                dafault : 'Point',
                enum    : ['Point']
            },
            coordinates : [Number],
            address     : String,
            description : String,
            day         : Number
        }
    ],
    guides : [
        {
            type   : mongoose.Schema.ObjectId,
            ref    : 'User'
        }
    ]
    
},
    {
    toJSON  : { virtuals: true},
    toObject: { virtuals: true }
    }
)

// tourSchema.index({price:1})
tourSchema.index({price:1,ratingsAverage:1})
tourSchema.index({slug:1})
tourSchema.index({startLocation:'2dsphere'})

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7
})

//virtual populate
tourSchema.virtual('reviews',{ 
    ref          : 'Review', // referencia del modelo a apuntar, es un id reference
    foreignField : 'tour',  // key de la referencia a la que apunta
    localField   : '_id' // key del propio modelo con la que hara match en referencia
})

// DOCUMENT MIDDLEWARE: run before .save() and .create()
tourSchema.pre('save',function(next){
    //este middleware se ejecuta antes de que envie el body a la bd
    this.slug = slugify(this.name,{upper:true})
    next();
})

// tourSchema.pre('save',async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })
// tourSchema.pre('save',function(next){
//     //este middleware se ejecuta antes de que envie el body a la bd
//     console.log('will save document...')
//     next();
// })
// tourSchema.post('save',function(next){
//     //este middleware se ejecuta antes de que envie el body a la bd
//     console.log(this)
//     next();
// })
//QUERY MIDDLEWARE
//esotos middleware se ejecutan cuando el query de moongose se ejecuto o ejecutará
// tourSchema.pre('find',function(next){ whitout regex
tourSchema.pre(/^find/,function(next){ //with regex
    this.find({secretTour:{$ne:true}})
    this.start = Date.now();
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt'
    })
    next()
})
tourSchema.post(/^find/,function(docs,next){
    // console.log(`Query took ${Date.now - this.start} milliseconds`)
    // console.log(docs)
    next()
})
//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{ secretTour: { $ne: true } }})
//     // console.log(this.pipeline)
//     next()
// })

const Tour = mongoose.model('Tour',tourSchema)// con esto definimos, el nombre de la collecion y estructura


module.exports = Tour