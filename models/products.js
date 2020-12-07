const { Schema, model } = require('mongoose');

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name field is required'],
    },
    category : {
      type:String,
      required: [true, 'category field is required'],
  },
  description: {
    type:String,
  },
  image: {
    type:String,
  },
    price: {
    type:Number,
  },

  },
  { timestamps: true },
);

module.exports = model('products', ProductSchema);
