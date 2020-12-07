'use strict';
var slugify = require('slugify')
const catchAsync = require('./../utils/catchAsync')
const User = require('../models/user_schema');
const AppError =  require('./../utils/appError')
const Category = require('../models/category');

const createData = catchAsync( async(req, res, next) => {
  const data = await Category.create({
    name: req.body.name,
    slug: slugify(req.body.name),
  })
      res.status(200).json({
        success:true,
        data
      });
});


const readData = (req, res) => {
  Category.find()
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
};

module.exports = {
  createData,
  readData
};
