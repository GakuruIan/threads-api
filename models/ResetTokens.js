const mongoose = require('mongoose')

const ResetTokenSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    token:{
        type:String,
        required:true
    },
    expiresAt:{
        type:Date,
        require:true
    }
})

module.exports = mongoose.model('ResetToken',ResetTokenSchema)
