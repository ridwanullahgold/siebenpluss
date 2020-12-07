const AppError  = require('./../utils/appError')
const sendErrorDev = (err,res) => {
    res.status(err.statusCode).json({        
        err,
        status : err.status,
        message : err.message,
        stack:err.stack,

    })
}
const handleJWTExpired = err => new AppError('Your Token has expired! Please try again later', 401)
const handleJWTError = err => new AppError('Invalid token. Please log in again', 401)
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path} : ${err.value}.`
    return new AppError(message, 400)
}
const handleDuplicateFieldsDB = err => {
    const value= err.keyValue[Object.keys(err.keyValue)[0]]
    const message = ` ${value} already exists. Please try another one.`
    return new AppError(message, 400)
}
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(val => val.message)
    const message = `${errors.join('; ')}`
    // console.log(err)
    return new AppError(message, 400)
}
const sendErrorProd = (err,res) => {
    if(err.isOperational){
        // Operational
        res.status(err.statusCode).json({
            status : err.status,
            message : err.message,
        })    
    } else{
        console.log(err)
        // Programming or other unkown error : dont leak error details
        res.status(500).json({
            status : 'Error',
            message : 'Something went really wrong',
        })
    }
}

exports.failure = (err, req,res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'
    if(process.env.NODE_ENV === 'production'){
        let error= {...err}
        if(error.kind==='ObjectId') { error = handleCastErrorDB(error) 
            sendErrorProd(error,res) }
        if(error.name === 'JsonWebTokenError') { error  = handleJWTError(error)   
            sendErrorProd(error,res)} 
        if(error.name === 'TokenExpiredError') { error = handleJWTExpired(error)  
        sendErrorProd(error,res) }
        if(error.code === 11000) { error = handleDuplicateFieldsDB(error)  
            sendErrorProd(error,res) }
        if(err.name === 'ValidationError') { error = handleValidationErrorDB(error)  
        sendErrorProd(error,res)
        }
        sendErrorProd(err,res)
        
    } else if(process.env.NODE_ENV === 'development'){
      
        sendErrorDev(err,res)
        // console.log(process.env.NODE_ENV)
    } 
}