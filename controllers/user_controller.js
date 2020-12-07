'use strict';
const catchAsync = require('./../utils/catchAsync')
const User = require('../models/user_schema');
const AppError =  require('./../utils/appError')

const filterObj = (obj, ...allowedFields)=> {
  const newObj = {}
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el] 
  })
  return newObj;
}
const updateProfile= catchAsync (async (req, res, next) => {
  const filtered = filterObj(req.body, 
    'company_name', 'industry', 'employeeSize', 'yearCreated', 'category', 'about',
     'facebook', 'twitter','linkedln','googlePlus','phoneNumber','website','country',
     'city','latitude','longitude'
    )
  const data = await User.findByIdAndUpdate(req.user.id, filtered, {
    useFindAndModify: false,
    new:true,
    runValidators:true
  })

  res.status(200).json({
    success:true,
    data
  });

})
const updateMe= catchAsync (async (req, res, next) => {
  if(req.body.password || req.body.confirmPassword){
    return next (new AppError("This route is not for password update. please use /updatePassword", 400));
  }
  const filtered = filterObj(req.body, 'name', 'email')
  const data = await User.findByIdAndUpdate(req.user.id, filtered, {
    useFindAndModify: false,
    new:true,
    runValidators:true
  })

  res.status(200).json({
    success:true,
    data
  });

})

const readData = catchAsync( async(req, res, next) => {
  const data = await User.findById(req.user.id).populate({
    path:'category',
    select:'-__v -updatedAt'
  }).populate({
    path:'industry',
    select:'-__v -updatedAt'
  })
      res.status(200).json({
        success:true,
        data
      });
});

const createData = catchAsync( async(req, res, next) => {
  const data = await User.create(req.body)
      res.status(200).json({
        success:true,
        data
      });
});


const updateData = (req, res) => {
  User.findByIdAndUpdate(req.params.id, req.body, {
    useFindAndModify: false,
    new: true,
  })
    .then((data) => {
      console.log('User updated!');
      res.status(201).json(data);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        console.error('Error Validating!', err);
        res.status(422).json(err);
      } else {
        console.error(err);
        res.status(500).json(err);
      }
    });
};

const deleteData = (req, res) => {
  User.findById(req.params.id)
    .then((data) => {
      if (!data) {
        throw new Error('User not available');
      }
      return data.remove();
    })
    .then((data) => {
      console.log('User removed!');
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
};

module.exports = {
  createData,
  readData,
  updateData,
  deleteData,
  updateMe,
  updateProfile
};
