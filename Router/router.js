const express = require('express')

const UserController = require('../Controllers/Users')
const PostController = require('../Controllers/Posts')
const NotificationController = require('../Controllers/Notification')

const SingleUpload = require('../Services/SingleUpload')
const MultipleUpload = require('../Services/MultipleUploads')

const VerifyToken = require('../middleware/Auth')

module.exports =(io)=>{
     const router = express.Router()

router.get('/',(req,res)=>{
     res.json({"message":"main page"})
})

router.get('/getMe/:id',UserController.GetMe);

router.post('/register',SingleUpload,UserController.Register)

router.post('/login',UserController.Login)

router.put('/update',SingleUpload,VerifyToken,UserController.UpdateProfile)

router.delete('/delete/user',VerifyToken,UserController.HandleDelete)

router.post('/logout',UserController.Logout)

router.post("/create/thread",MultipleUpload.array('photos'),PostController.CreatePost)

router.delete('/delete/:id',VerifyToken,PostController.DeleteThread)

router.get("/threads",VerifyToken,PostController.FetchPosts);

router.get('/user/:username',VerifyToken,UserController.GetUser);

router.get('/user/:username/threads',VerifyToken,UserController.GetUserThreads)

router.get('/thread/:id',VerifyToken,PostController.FetchPost)

router.post('/create/:threadID/comment',VerifyToken,PostController.CreateComment)

router.post('/search',VerifyToken,UserController.FindUser)

router.post('/like/:id',VerifyToken,PostController.LikeThread)

router.post('/unlike/:id',VerifyToken,PostController.UnlikeThread)

router.post('/follow',VerifyToken,UserController.HandleFollow)

router.post('/unfollow',VerifyToken,UserController.HandleUnFollow)

router.get('/notifications',VerifyToken,NotificationController.GetNotifications)

router.put('/notification/:id/update',VerifyToken,NotificationController.UpdateNotification)

return router
}
