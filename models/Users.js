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
    ],
    posts:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Posts',
        foreign_key: "_id",
        is_list: true,
       }
    ],
    comments:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment',
        foreign_key: "_id",
        is_list: true,
      }
    ],
    notifications:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Notification',
            foreign_key: "_id",
            is_list: true,
        }
    ]
    
},{timestamps:true})

// remove 
usersSchema.pre('deleteOne',async function(next){
    try {
        const userID = this._id

        await mongoose.model('Posts').deleteMany({ author: userID });
        await mongoose.model('Comment').deleteMany({ author: userID });
        next()
    } catch (error) {
        next(error)
    }
})

module.exports = mongoose.model("user",usersSchema)