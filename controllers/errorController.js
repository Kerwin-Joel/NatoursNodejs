const AppError = require("../utils/appError");

const handleKindErrorDB = err =>{
    const message = `Invalid ${err.path}:${err.value}`;
    return new AppError(message, 400);
}
const handleDuplicateFieldsDB = err =>{
    const fields = JSON.stringify(err.keyValue).replace(/[\{\""}']+/g,'')
    const message = `Duplicate field: ${fields}`
    return new AppError(message,500)
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(val =>val.message)
    const message = `Invalid input data. ${errors.join(', ')}`;
    return new AppError(message,400)
}
const handleJsonWebTokenError = err => {
    const message = `Invalid token please login again.`;
    return new AppError(message, 401);
}
const handleTokenExpiredError = err => {
    const message = `token expired please login again.`;
    return new AppError(message, 401);
}

const sendErrorDev = (err, res)=> {
    res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack,
    })
}

const sendErrorProd = (err,res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message,
        })
        // Programming or other unknown error: don't leak error details'
    } else {
        // 1) Log error
        console.log('Error: 💥', err);
        // 2) Send generic message
        res.status(err.statusCode).json({
            status:'error',
            message:'Something went very wrong',
        })
    }
}


module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err,res)
    } else if(process.env.NODE_ENV === 'production') {

        let error = {...err};

        if (error.kind === 'ObjectId') error = handleKindErrorDB(error)
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        if (error._message === 'Validation failed') error = handleValidationErrorDB(error)
        if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError(error)
        if (error.name === 'TokenExpiredError') error = handleTokenExpiredError(error)
        sendErrorProd(error,res)
    }
}