const crypto        = require('crypto');
const { promisify } = require('util');
const User          = require("../model/userModel")
const catchAsync    = require("../utils/catchAsync")
const jwt           = require("jsonwebtoken")
const AppError      = require("../utils/appError");
const Email         = require('../utils/email');




const signToken = (id)=>{
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )
}

const createSendToken = (user, stausCode, req, res) => {
    const token = signToken(user._id)
    const cookieOptions ={
        expires:new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly : true,
        secure   : req.secure || req.headers['x-forwarded-proto'] === 'https'
    };
    res.cookie('jwt',token,cookieOptions)
    user.password= undefined;
    res.status(stausCode).send({
        status: "success",
        token,
        data: {
            user
        }
    })
}


exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    })

    const url = `${req.protocol}://${req.get('host')}/me`

    await new Email(newUser,url).sendWelcome()

    createSendToken(newUser,201,req,res)
})
exports.login = catchAsync(async(req, res, next)=>{

    const {email, password} = req.body// get inputs of user

    if (!email || !password) {
        return next(new AppError('Please prvide email or password', 400)); // return error if input have errors
    }
    const [user] = await User.find({email}).select('+password') // find user if havent error
    //find retur a array of object that coincide with the query
        //with find need a desestructuring a first object of array because the "[]" in the line 36 
    //findOne return a object that coincide with the query

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Icorrect email or password', 401))
    }

    createSendToken(user,201,req,res)

})
exports.protected = catchAsync(async (req, res, next)=>{

    //1) get token and check if it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
    }else if(req.cookies.jwt){
        token = req.cookies.jwt
    }
    //2) check if token is not there
    if(!token){
        return next(new AppError('You are not logged in', 401))
    }
    //3) verify token
    const  decoded  =  await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    
    //4) check if user still exists
    const refreshUser = await User.findById(decoded.id)
    if(!refreshUser){
        return next(new AppError('The user belonging to this token does no longer exist', 401))
    }
    //5)check if user changed password after the token was issued
    if(refreshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password, please try again', 401))
    }
    req.user = refreshUser // pass the data user refresh to the next middleware
    //remember that req object travel for all the middlewares and that have a effect cascade
    next()
})
//Only to rendered pages, no erros
exports.isLoggedIn = async (req, res, next)=>{
    //1) get token
    // console.log(req)
    if(req.cookies.jwt){
                        // promisify to convert a async await
        const decoded = await promisify(jwt.verify)(
            req.cookies.jwt, 
            process.env.JWT_SECRET
        )
        //2) CHECK IF USER STILL EXIST
        const currentUser = await User.findById(decoded.id)
        if(!currentUser){
            return next()
        }
        if(currentUser.changedPasswordAfter(decoded.iat)){
            return next()
        }
        res.locals.user = currentUser
        return next()

    }
    next()
}
exports.logout = (req, res, next)=>{
    res.cookie('jwt', 'tokenrandom', {
        expires: new Date(Date.now() + 1 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        status: 'success',
        message: 'You are now logged out'
    })
}
exports.restricTo =  (...roles) => {
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)) return next(new AppError('You do not have permission to perform this action', 403))
        next()
    }
}

exports.forwardPassword =  catchAsync(async(req, res, next) => {
    //1) get user based on posted email
    const user = await User.findOne({email: req.body.email})

    if(!user) return next(new AppError('There is no user with this email', 404))
    
    //2) Generate a random reset
    const resetToken = user.createPasswordResetToken()
    await user.save({validateBeforeSave:false})
    
    //3) Send it to user's email
    try {
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

        let result = await new Email(user, resetUrl).sendPasswordReset()
        console.log(result)

        res.status(200).json({
            status:'success', 
            message:'token sent to email'
        })
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave:false})
        return next(new AppError('There was an error seding email. Try again later',500))
    }

    
})

exports.resetPassword =  catchAsync( async(req, res, next) => {

    // 1) Get user based in token
    const hashedTokenUrl = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user =  await User.findOne({
        passwordResetToken:hashedTokenUrl,
        passwordResetExpires:{ $gt:Date.now() }
    });
    
    // 2) If token has not expired, and there is user, set new password
    if(!user) return next(new AppError('Token is invalid or expired',400));
    
    // 3) Update changePasswordAt property for the user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save()
    
    // 4) Log the user and send JWT
    createSendToken(user,201,req,res)

})

exports.updatePassword = catchAsync(async(req, res, next) => {
    
    const {passwordCurrent,passwordNew,passwordNewConfirmed} = req.body// get inputs of user

    // 1 ) Get user from coleccion
    const user = await User.findById(req.user.id).select('+password')
    // 2 ) Check if POSTed current password is correct
    if(!await user.correctPassword(passwordCurrent, user.password)) {
        return next(new AppError('Icorrect password', 401))
    }
    // 3 ) If so , updating password
    user.password = passwordNew;
    user.passwordConfirm = passwordNewConfirmed;
    const result = await user.save()
    // 4 ) Log user in , send JWT
    createSendToken(user,201req,,res)

})