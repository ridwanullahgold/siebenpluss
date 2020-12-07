const { Schema, model } = require('mongoose');

const OrderSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name field is required'],
    },
    email : {
      type:String,
      required:[true, 'A user must have a unique email'],
      unique:true,
      lowercase:true,
  },
  address: {
    type:String,
  },
  cart: {
    type:String,
  },
total: {
    type:Number,
  },

  },
  { timestamps: true },
);

// userSchema.pre('save', async function(next){
//   this.password = await bcrypt.hash(this.password, 12)
//   next()
// })

module.exports = model('orders', OrderSchema);
