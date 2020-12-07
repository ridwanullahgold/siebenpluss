const { Schema, model } = require('mongoose');
const Bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const randomstring = require('randomstring'); 
const validator = require('validator'); 
const Crypto = require('crypto')

const userSchema = new Schema(
  {
    first_name: {
      type: String,
      required: [true, 'First Name is required'],
    },
    last_name: {
      type: String,
      required: [true, 'Last Name is required'],
    },
    role :{
      type:String,
      enum:['Admin', 'Candidate','Employer'],
      default: 'Candidate',
    },
    email : {
      type:String,
      required:[true, 'A user must have a unique email'],
      unique:true,
      lowercase:true,
  },
  password: {
    type:String,
    required:[true, 'Please provide a password'],
    minlength:5,
    // select:true
  },
  confirmPassword: {
    type:String,
    required:[true, 'Please Confirm your password'],
    minlength:5,
    validate: {
      validator : function(el) {
        return el === this.password
      },
      message: "Passwords are not the same!"
    }
  },
  emailConfirmedAt: Date,
  emailConfirmCode: String,
  passwordChangedAt : Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  photo: String,
  company_name: String,
  industry:  [ 
    {
      type: Schema.ObjectId,
      ref: 'Industry'
    }
  ],
  employeeSize: String,
  yearCreated:{
  type: Number,
  },
  category: [ 
    {
      type: Schema.ObjectId,
      ref: 'Category'
    }
  ],
  about: String,
  facebook:String,
  twitter: String,
  linkedln: String,
  googlePlus: String,
  phoneNumber: String,
  website: String,
  country: String,
  city: String,
  latitude: String,
  longitude: String,
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if(!this.isModified('password')) return next();
  this.password = await Bcrypt.hash(this.password, 12)
  this.confirmPassword = undefined
  this.createdAt = new Date()
  next()
})

userSchema.pre('save', function (next) {
  if(!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000
  next()

})

userSchema.methods.comparePasswords = async function(mypass) {
  return await Bcrypt.compare(mypass, this.password)
}

userSchema.methods.changedPasswordAfter = async function(JWTTimestamp) {
  if(this.passwordChangedAt){
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return JWTTimestamp < changedTimestamp
  }
  return false;
}

userSchema.methods.generateToken = function() {
  return jwt.sign({id:this._id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

userSchema.methods.createResetToken = function() {
  const token = Crypto.randomBytes(40).toString('hex')
  // this.passwordResetToken= Crypto.createHash('sha256').update(token).digest('hex')
  this.passwordResetToken= token
  this.passwordResetExpires = Date.now() + 150 * 60 * 1000
  return token
}

module.exports = model('User', userSchema);
