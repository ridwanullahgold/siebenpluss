const { Schema, model } = require('mongoose');

const IndustrySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Industry field is required'],
    },
    description : {
      type:String,
  }
  },
  { timestamps: true },
);

module.exports = model('Industry', IndustrySchema);
