const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    caption:{
        type:String,
    },
    photos:[
        {
            path:{
                type:String,
            }
        }
    ],
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ],
    shares:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ],
    comments:[
        {
            author:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'user'
            },
            content:{
                type:String,
                required:true
            },
            createdAt:{
                type:Date,
                default:Date.now()
            }
        }
    ]
},{timestamps:true})

module.exports = mongoose.model('Posts',postSchema)