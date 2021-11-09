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

const sendErrorDev = (err,req, res)=> {
    if(req.originalUrl.startsWith('/api')){
        res.status(err.statusCode).json({
            status:err.status,
            error:err,
            message:err.message,
            stack:err.stack,
        })
    }else{
        res.status(err.statusCode).render('error',{
            title:'Something went wrong',
            msg:err.message,
        })
    }
}

const sendErrorProd = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        // A) Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
            });
        }
      // B) Programming or other unknown error: don't leak error details
      // 1) Log error
        console.error('ERROR 💥', err);
      // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
    // B) RENDERED WEBSITE
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
        console.log(err);
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });
};

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err,req,res)
    } else if(process.env.NODE_ENV === 'production') {

        let error = {...err};

        if (error.kind === 'ObjectId') error = handleKindErrorDB(error)
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        if (error._message === 'Validation failed') error = handleValidationErrorDB(error)
        if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError(error)
        if (error.name === 'TokenExpiredError') error = handleTokenExpiredError(error)
        sendErrorProd(error,req,res)
    }
}