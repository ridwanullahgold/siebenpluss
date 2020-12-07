// Importing required modules
const cors = require('cors');
const express = require('express');
const cookieParser = require("cookie-parser");
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/error_controller')
// const formidableMiddleware = require("express-formidable")

// parse env variables
require('dotenv').config();

require("./helpers/db/mongodb.js")();

// Configuring port
const port = process.env.PORT || 9000;

const app = express();

// Configure middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// app.use(formidableMiddleware());

app.set('view engine', 'html');

// Static folder
app.use(express.static(path.join(__dirname, "./dist")))
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, './dist', 'index.html'))
})
// app.use(express.static(__dirname + '/public/'));

//Middleware to allow cross origin
app.use(function (req, res, next){
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");

    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    // Request headers you wish to allow 
    res.setHeader("Access-Control-Allow-Methods", "X-Requested-With,content-type", "x-access-token, Origin, Content-Type, Accept");
    // Set to treu if you need the website to include cookies in the request sent
    // to the API(e.g in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to the next layer pf middleware
    next()
})


// Defining route middleware
app.use('/user', require('./routes/user'));
app.use('/categories', require('./routes/category'));
app.use('/industries', require('./routes/industry'));
app.use('/products', require('./routes/product'));
app.use('/orders', require('./routes/orders'));
app.use('/auth', require('./routes/auth'));
app.use('/employer/jobs', require('./routes/job'));
app.all('*', (req, res, next)=>{
    // res.status(404).json({
    //     status: 'fails',
    //     message: `The ${req.originalUrl} Page Not Found`
    // })
    
    next(new AppError(`The ${req.originalUrl} Page is  Not Found`, 404))
})

// ?ERROR HANDLING MW
app.use(globalErrorHandler.failure)


// Listening to port 
const server = app.listen(port, () => {
    console.log(`Listening On http://localhost:${port}`);
});

process.on('unhandledRejection', err => {
    console.log('Unhandler rejection 🚭')
    console.log(err.name, err.message)
    server.close(()=> {
        process.exit(1)
    })
})
process.on('uncaughtException', err => {
    console.log('Uncaught exception 🚭')
    console.log(err.name, err.message)
    server.close(()=> {
        process.exit(1)
    })
})

module.exports = app;
