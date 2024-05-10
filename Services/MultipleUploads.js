const Cloudinary = require('./Cloudinary')

const {CloudinaryStorage} = require('multer-storage-cloudinary')
const multer = require('multer')

const storage = new CloudinaryStorage({
    cloudinary:Cloudinary,
    params:{
        folders:"Threads"
    }
})

const upload = multer({storage:storage})

module.exports = upload