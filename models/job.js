const { Schema, model } = require('mongoose');
const slugify= require('slugify')
const JobSchema = new Schema(
{
    title: {
      type: String,
      required: [true, 'Title field is required'],
    },
    slug:{
      type:String,
    },
    email : {
      type:String,
      required:[true, 'A user must have a unique email'],
      lowercase:true,
    },
    category: [ 
        {
          type: Schema.ObjectId,
          ref: 'Category'
        }
    ],
    industry:  [ 
        {
          type: Schema.ObjectId,
          ref: 'Industry'
        }
    ],
    description: {
        type: String,
    },
    salary: {
        type:String,
    },
    gender: {
        type:String,
        enum:['Male','Female','Both']
    },
    level: {
        type:String,
        enum:["Beginner", "Intermediate", "Advanced"]
    },
    type:{
        type:String,
        enum:["Full-Time", "Part-Time", "Freelance", "Intern"]
    },
    qualification:{
        type:String
    },
    deadline:{
        type:Date
    },
    skills:{
        type:Array
    },
    country: {
        type:String
    },
    city: {
        type:String
    },
  address: {
    type:String,
  },
  findmap:{
      type:String,
  },
  latitude:{
      type:String,
  },
  longitude:{
      type:String,
  },
  user:[ 
    {
      type: Schema.ObjectId,
      ref: 'User'
    }
  ],
  },
  { timestamps: true },
);

JobSchema.pre('save', function(next){
  this.slug = slugify(this.title)
  next()
})

module.exports = model('Job', JobSchema);
