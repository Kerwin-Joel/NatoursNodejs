const User          = require("../model/userModel");
const catchAsync    = require("../utils/catchAsync");
const AppError      = require('../utils/appError');
const factory       = require("./handleFactory");


const filterObj = (obj,...allowFields)=>{
    const newObj = {}
    Object.keys(obj).forEach(el=>{
        if (allowFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj
}

//FUNCTIONES TO USERS (CONTROLLERS)

exports.postUser = (req, res)=>{
    res.status(500).json({
        status: 'error', 
        message: 'this route yet not defined / Please use /sigin instead'
    })
}
exports.getMe       = (req, res, next) =>{
    req.params.id = req.user.id
    next()
}



exports.getAllUsers = factory.getAll(User)
exports.getUser     = factory.getOne(User)
exports.patchUser   = factory.updateOne(User)
exports.deleteUser  = factory.deleteOne(User)

exports.updateUserData =catchAsync(async(req, res, next) => {
    // 1) Create error if user Post password data
    if(req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError('This route is not for password updates.Please use /updatePassword',400))
    };
    // 2) Filtered out unwanted fields names that not allowed to be update 
    const filteredBody = filterObj(req.body,'name','email')
    // 3) Update user document
    const updateUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    })
    res.status(200).json({ 
        status:'success',
        data:{
            user:updateUser,
        }
    })
})
exports.deleted = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id,{
        active:false
    })
    res.status(200).json({
        status: 'success',
        data:null
    })
})