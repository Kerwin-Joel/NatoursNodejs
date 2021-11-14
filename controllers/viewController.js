const Tour      = require('../model/tourModel')
const User      = require('../model/userModel')
const Booking   = require('../model/bookingModel')
const AppError  = require('../utils/appError')
const catchAsync= require('../utils/catchAsync')

exports.getOverview = catchAsync(async(req, res)=>{

    // 1) Get tour data from collecion
    const tours = await Tour.find()
    // 2) Build template

    // 3) Render that template using tour data from 

    res.status(200).render('overview',{
        title    : 'All tours',
        tours
    })
})

exports.getTour = catchAsync(async (req, res,next)=>{

    // 1) Get the data,for the request  tour (including reviews and guides)
    const slug = req.params.slug
    const tour = await Tour.findOne({slug}).populate({
        path    : 'reviews',
        fields  : 'reviews ratings user'
    })
    if(!tour){
        return next(new AppError('There is no tour with that name', 404))
    }

    // 2) Render  template usingdata from 1  
    res.status(200)
        .render('tour',{
            title    : `${tour.name} Tour`,
            tour
        })
})

exports.getLoginForm = catchAsync(async (req, res)=>{
    res.status(200)
        .set(
            'Content-Security-Policy',
            "connect-src 'self' https://cdnjs.cloudflare.com"
        )
        .render('login',{
            title   : 'Log into your acount',
        })
})

exports.getAccount = catchAsync(async (req, res)=>{
    res.status(200)
        .render('account',{
            title   : 'Account'
        })
})
//Este metodo es para el formulario html con metodo POST sin JS
exports.updateUserData = catchAsync(async (req, res)=>{
    const {email, name} = req.body
    const id = req.user.id
    const updateUser = await User.findByIdAndUpdate(id,{
        email,
        name
    },{
        new:true, // para devolver el documento modificado 
        runValidators:true // si es true ejecuta los validadores de update del modelo
    })
    res.status(200)
        .render('account',{
            title   : 'Account',
            user: updateUser
        })
})

exports.getMyTours = catchAsync(async (req, res)=>{
    // 1) Find all Bookings
    const bookings = await Booking.find({user: req.user.id})
    
    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour)
    const tours = await Tour.find({_id: {$in: tourIDs}})
    
    res.status(200).render('overview',{
        title    : 'My Tours',
        tours
    })
    
})