const multer = require('multer')

const storage = multer.memoryStorage()
const SingleUpload = multer({storage,limits: { fileSize: 10 * 1024 * 1024 }}).single('avatar')

module.exports = SingleUpload