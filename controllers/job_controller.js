'use strict';
var slugify = require('slugify')
const catchAsync = require('./../utils/catchAsync')
const User = require('../models/user_schema');
const AppError =  require('./../utils/appError')
const Category = require('../models/category');
const Job = require('../models/job');
const filterObj = (obj, ...allowedFields)=> {
    const newObj = {}
    Object.keys(obj).forEach(el => {
      if(allowedFields.includes(el)) newObj[el] = obj[el] 
    })
    return newObj;
}
const createData = catchAsync( async(req, res, next) => {
const filtered = filterObj(req.body, "title","industry","category", "description", "email","salary",
"gender", "level", "type","qualification", "deadline","skills",
"country", "city", "address", "findmap", "latitude", "longitude")
  const data = await Job.create(filtered);
    data.user = req.user.id
    await data.save({validateBeforeSave:false})
      res.status(200).json({
        success:true,
        data
      });
});

const updateData = catchAsync( async(req, res, next) => {
const filtered = filterObj(req.body, "title","industry","category", "description", "email","salary",
"gender", "level", "type","qualification", "deadline","skills",
"country", "city", "address", "findmap", "latitude", "longitude")
const data = await Job.findByIdAndUpdate(req.params.id, filtered, {
  useFindAndModify: false,
  new:true,
  runValidators:true
})

      res.status(200).json({
        success:true,
        data
      });
});

const readData = catchAsync( async(req, res, next) => {
  const data = await Job.find().populate({
    path:'category',
    select:'-__v -updatedAt'
  }).populate({
    path:'industry',
    select:'-__v -updatedAt'
  }).populate({
    path:'user',
    select:'first_name last_name'
  });
      res.status(200).json({
        success:true,
        data
      });
});

const readDataByUser = catchAsync( async(req, res, next) => {
  const data = await Job.findOne({user:req.user.id}).populate({
    path:'category',
    select:'-__v -updatedAt'
  }).populate({
    path:'industry',
    select:'-__v -updatedAt'
  })
    .populate({
    path:'user',
    select:'-__v -updatedAt'
  });
      res.status(200).json({
        success:true,
        data
      });
});


module.exports = {
  createData,
  readData,
  readDataByUser,
  updateData
};
