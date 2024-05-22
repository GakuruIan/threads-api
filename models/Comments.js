const mongoose = require('mongoose')


const CommentSchema = new mongoose.Schema({
    comment:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user',
        foreign_key: "_id",
        is_list: false,
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Posts',
        foreign_key: "_id",
        is_list: false,
    }
},{timestamps:true})

module.exports = mongoose.model('comments',CommentSchema)