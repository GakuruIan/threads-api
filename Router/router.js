const express = require('express')

const router = express.Router()

const UserController = require('../Controllers/Users')
const PostController = require('../Controllers/Posts')

const SingleUpload = require('../Services/SingleUpload')
const MultipleUpload = require('../Services/MultipleUploads')

const VerifyToken = require('../middleware/Auth')

router.get('/',(req,res)=>{
     res.json({"message":"main page"})
})

router.get('/getMe/:id',UserController.GetMe);

router.post('/register',SingleUpload,UserController.Register)

router.post('/login',UserController.Login)

router.post('/logout',UserController.Logout)

router.post("/create/thread",MultipleUpload.array('photos'),PostController.CreatePost)

router.get("/threads",PostController.FetchPosts);

router.get('/user/:username',VerifyToken,UserController.GetUser);

router.get('/user/:username/threads',VerifyToken,UserController.GetUserThreads)

router.get('/thread/:id',VerifyToken,PostController.FetchPost)

router.post('/create/:threadID/comment',VerifyToken,PostController.CreateComment)

router.post('/search',VerifyToken,UserController.FindUser)

router.post('/like/:id',VerifyToken,PostController.LikeThread)

router.post('/follow',VerifyToken,UserController.HandleFollow)

router.post('/unfollow',VerifyToken,UserController.HandleUnFollow)
module.exports = router