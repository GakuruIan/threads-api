const Cloudinary = require('./Cloudinary')

const {CloudinaryStorage} = require('multer-storage-cloudinary')
const multer = require('multer')

const storage = new CloudinaryStorage({
    cloudinary:Cloudinary,
    params:{
        folder:`Threads`,
        allowed_formats: ['jpg', 'png','jpeg'],
    } 
})

const upload = multer({storage:storage})

module.exports = upload