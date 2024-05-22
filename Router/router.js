const express = require('express')

const router = express.Router()

const UserController = require('../Controllers/Users')
const PostController = require('../Controllers/Posts')

const SingleUpload = require('../Services/SingleUpload')
const MultipleUpload = require('../Services/MultipleUploads')

router.get('/',(req,res)=>{
     res.json({"message":"main page"})
})

router.get('/getMe/:id',UserController.GetMe);

router.post('/register',SingleUpload,UserController.Register)

router.post('/login',UserController.Login)

router.post("/create/thread",MultipleUpload.array('photos'),PostController.CreatePost)

router.get("/threads",PostController.FetchPosts);

router.get('/user/:username',UserController.GetUser);
 
module.exports = router