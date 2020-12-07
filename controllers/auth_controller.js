'use strict';
const { promisify } = require('util')
const catchAsync = require('./../utils/catchAsync')
const User = require('../models/user_schema');
const AppError =  require('./../utils/appError')
const jwt = require('jsonwebtoken');
const randomstring =  require('randomstring')
const Crypto = require('crypto')
// const sendEmail = require('./../utils/email')
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const filterObj = (obj, ...allowedFields)=> {
    const newObj = {}
    Object.keys(obj).forEach(el => {
      if(allowedFields.includes(el)) newObj[el] = obj[el] 
    })
    return newObj;
  }
// Registering User's data
const signUp = catchAsync( async(req, res, next) => {
    const filtered = filterObj(req.body, 'first_name', 'last_name', 'email', 'role', 'password', 'confirmPassword')
    const user = await User.create(filtered)
    user.emailConfirmCode = randomstring.generate(72)
    await user.save({validateBeforeSave:false})
    const resetURL= `http://localhost:8080/confirm-email/${user.emailConfirmCode}`
    try{
        // Sending email
        const sendEmail = async options => {
            // 1) Create a transporter
            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                secure: false,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });  
            // 2) E-mail options
            const link = resetURL
            ejs.renderFile(__dirname + "./../views/template.ejs", {name:user.first_name, link}, async function (err, data) {
                if (err) {  
            return next (new AppError("Error sending email", 500));
    
                } else {
            const mailOptions = {
                from : 'Muyiwa Olugbebi <muyiwaolugbebi@gmail.com>',
                to:options.email,
                subject:options.subject,
                html:data
            }
            // 3) Actually send the mail
            await transporter.sendMail(mailOptions)
        }
        })
        }
        // Finally sending email
        await sendEmail({
            email:user.email,
            subject: 'E-mail Confirmation Code' 
        })
        // if(!hi){
        // return next (new AppError("Error sending email. Please try again", 500));
        // }
    // Done sending email
        return res.status(201).json({
            success: true,
            user,
            message: 'E-mail confirmation code sent successfully'
        })
    }catch (err){
        user.emailConfirmCode = undefined
        user.emailConfirmedAt = undefined
        await user.save({validateBeforeSave:false})
        return next (new AppError("Error sending email", 500));
    }
 

  });
  
// Login User data
const loginData = catchAsync (async (req, res, next) => {
    const { email, password } = req.body
    if(!email || !password){
        return next(new AppError("Email and password fields must be filled", 400))
    }
    const user = await User.findOne({ email, emailConfirmCode:null }).select('+password')
    if(!user || !(await user.comparePasswords(password))){
        return next(new AppError("Credentials do not match our records", 400))

    }
      if (user) {
        

        if (user.comparePasswords(password)) {
            const token = user.generateToken()
            res.cookie('jwt', token, {
                expires: new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRES * 24 * 60 *60 *1000),
                // secure:true,
                httpOnly:true
            })
            return res.status(201).json({
                success: true,
                user,
                token
            })
        }
    }
    return next(new AppError("Credentials do not match our records", 400))

});

const verifyToken = catchAsync (async (req, res, next) => {
    // Getting token and check if it exists
    let token = req.headers["x-access-token"];
    // console.log(req.cookies)
    // let token = req.cookies;

    if (!token) {
        // return next(new AppError("Credentials do not match our records", 400))
      return next (new AppError("You are not logged in. Please log in to get access", 401));
    }
    // Verifying token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    //   console.log(decoded)
    
    // Check if user exists
    const freshUser = await User.findById(decoded.id)
    if(!freshUser){
      return next (new AppError("The user does not exist", 401));
    }
    // Check if user changed Password
      if(await freshUser.changedPasswordAfter(decoded.iat)){
      return next (new AppError("Password recently changed, please log in again", 401));
      }
      req.user = freshUser;
    next()

})

const restrictTo = (...roles) => {
    return(req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next (new AppError("Forbidden! You do not have permission to this path", 403));
        }
        next()
} 
}

const forgotPassword = catchAsync (async (req, res, next) => {
    // Get user based on email
    const user = await User.findOne({email : req.body.email})
    if(!user){
        return next (new AppError("User does not exist with the email address provided!", 404));
    }
    // 2) Generate token
    const token = user.createResetToken()
    await user.save({validateBeforeSave:false})

    // Send email to user
    // const resetURL= `${req.protocol}://${req.get('host')}/auth/reset/${token}`
    const resetURL= `http://localhost:8080/reset-password/${token}`
    // const message = `Forgot password with ${resetURL}`
try{
    // Sending email
    const sendEmail = async options => {
        // 1) Create a transporter
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });  
        // 2) E-mail options
        const link = resetURL
        const title='Reset Password';
        const message = "Please reset your password. The reset token will expire after 1 hour"
        ejs.renderFile(__dirname + "./../views/reset.ejs", {name:user.first_name, link, title, message}, async function (err, data) {
            if (err) {  
        return next (new AppError("Error sending email", 500));

            } else {
        const mailOptions = {
            from : 'Muyiwa Olugbebi <muyiwaolugbebi@gmail.com>',
            to:options.email,
            subject:options.subject,
            html:data
        }
        // 3) Actually send the mail
        await transporter.sendMail(mailOptions)
    }
    })
    }
    // Finally sending email
    await sendEmail({
        email:user.email,
        subject: 'Password Reset' 
    })
    // if(!hi){
    // return next (new AppError("Error sending email. Please try again", 500));
    // }
// Done sending email
    return res.status(201).json({
        success: true,
        message: 'Token sent to email'
    })
}catch (err){
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({validateBeforeSave:false})
    return next (new AppError("Error sending email", 500));
}
})

const resetPassword = catchAsync (async (req, res, next) => {
    const token = req.params.token;
    // const hashed = Crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
        passwordResetToken : token,
        passwordResetExpires :{ $gt: Date.now()}
        })
        
        // 2) if user does not exist
    if(!user){
        return next (new AppError("Invalid reset token provided!", 404));
    }
    // 3) Set the password
    user.password = req.body.password
    user.confirmPassword = req.body.confirmPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // 4) Reset token
    // const token = user.generateToken()
    // const token = jwt.sign({id:this._id}, process.env.JWT_SECRET)
    return res.status(201).json({
        success: true,
        user
    }) 
})

const updatePassword = catchAsync (async (req, res, next) => {
    // Get user collection
    const user = await User.findById(req.user.id).select('+password')
    // Check if posted password is incorrect

    if(!(await user.comparePasswords(req.body.passwordCurrent))){
        return next (new AppError("Your current password is wrong!", 401));
    }
    // Update password if valid
       user.password = req.body.password
       user.confirmPassword = req.body.confirmPassword
       user.passwordResetToken = undefined
       user.passwordResetExpires = undefined
       user.emailConfirmCode = undefined
       await user.save()
    //    Log in user
    const token = user.generateToken()
    // const token = jwt.sign({id:this._id}, process.env.JWT_SECRET)
    return res.status(200).json({
        success: true,
        user,
        token
    }) 

})

const confirmEmail =  catchAsync (async (req, res, next) => {
    const user = await User.findOneAndUpdate({
        emailConfirmCode  : req.params.token
    }, {
        emailConfirmCode: null,
        emailConfirmedAt: new Date()
    }, {  useFindAndModify: false,
        new:true,
        runValidators:true })
    if (!user) {
        return next(new AppError("Error confirming email...", 400))
    }
    //    Log in user
    const token = user.generateToken()
    // const token = jwt.sign({id:this._id}, process.env.JWT_SECRET)
    return res.status(200).json({
        success: true,
        user,
        token
    }) 

})
module.exports = {
    loginData,
    signUp,
    verifyToken,
    restrictTo,
    resetPassword,
    forgotPassword,
    updatePassword,
    confirmEmail
    
  };
  