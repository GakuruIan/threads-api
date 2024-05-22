const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user',
        foreign_key: "_id",
        is_list: false,
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
            type:mongoose.Schema.Types.ObjectId,
            ref:'comments',
            foreign_key: "_id",
            is_list: true,
        }
    ]
},{timestamps:true})

module.exports = mongoose.model('Posts',postSchema)