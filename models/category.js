const { Schema, model } = require('mongoose');

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category field is required'],
    },
    slug : {
      type:String,
      unique:true,
      lowercase:true,
  }
  },
  { timestamps: true },
);

module.exports = model('Category', CategorySchema);
