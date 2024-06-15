const mongoose = require('mongoose')

const NotificationSchema =new mongoose.Schema({
    message:{
        type:String,
        require:true
    },
    UserToNotify:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    notifier:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Posts'
    },
    read:{
        type:Boolean,
        default:false
    }
},{timestamps:true})


module.exports = mongoose.model("Notification",NotificationSchema)