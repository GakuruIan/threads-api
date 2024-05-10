const mongoose = require('mongoose')

const usersSchema = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
      type:String,
      required:true,
    },
     bio:{
        type:String
     },
    avatar:{
        public_id:{
            type:String,
           
          },
          url:{
              type:String,
          },
          folder:{
              type:String,
          }
    },
    following:[
       {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
       }
    ],
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
                ref:'user' 
        }
    ]
    
},{timestamps:true})

module.exports = mongoose.model("user",usersSchema)