'use strict';
const path = require("path");
const fs = require("fs")
const appDir = path.dirname(require.main.filename);
const Product = require('../models/products');

const createData = (req, res) => {
  const name= req.body.name;
  const category= req.body.category;
  const description= req.body.description;
  const price= req.body.price;
  const image = "noimage.png"
  // console.log(req.body)
  // const imageUpload= req.files.imageUpload;
  // let image = imageUpload ? imageUpload.name : "noimage.png";
  // if(image !== "noimage.png"){
  //   image= +new Date()+"_"+image;
  //   const oldPath = imageUpload.path;
  //   const newPath = `${appDir}/public/media/products/${image}`;
  //   const rawData = fs.readFileSync(oldPath);
  //   fs.writeFile(newPath, rawData, error => {
  //     console.log(error)
  //     res.status(500).end();
  //   })
  // }

  Product.create(  {
      name,
      category,
      description,
      image,
      price
     })
  .then((data) => {
    console.log('New Order Created!', data);
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

const readData = (req, res) => {
  const p = req.query.p ? req.query.p : 1;
  Product.find().skip((p-1)*3).limit(3)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
};

const readCatData = (req, res) => {
  const cat = req.params.category
  const p = req.query.p ? req.query.p : 1;
  Product.find({category:cat}).skip((p-1)*3).limit(3)
  .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
};

const countData = (req, res) => {
  const cat = req.params.category
  if(cat === "all"){
    Product.countDocuments({})
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
  }else {
    Product.countDocuments({category:cat})
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
  }
 
};

const updateData = (req, res) => {


  Product.findByIdAndUpdate(req.params.id, req.body, {
    useFindAndModify: false,
    new: true,
  })
    .then((data) => {
      console.log('Product updated!');
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
    Product.findById(req.params.id)
    .then((data) => {
      if (!data) {
        throw new Error('Product not available');
      }
      return data.remove();
    })
    .then((data) => {
      console.log('Product removed!');
      res.status(204).json(data);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
};

module.exports = {
  createData,
  readData,
  countData,
  readCatData,
  updateData,
  deleteData
};
