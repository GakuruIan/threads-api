const sockerIo = require('socket.io')
const Post = require('../models/Posts')

const {HandleUnlike,HandleLike,HandleFollow,HandleUnFollow} = require('../Functions/Functions')

const Notify = require('../Utils/NotifyUser')

let io
let connectedUsers = {}

module.exports = {
    init:(server)=>{
        io = sockerIo(server,{
            cors : {
                origin : 'http://localhost:5173',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
                allowedHeaders: ['Content-Type','Origin', 'X-Requested-With', 'Accept', 'x-client-key', 'x-client-token', 'x-client-secret', 'Authorization','Access-Control-Allow-Origin'],
                credentials: true
            }
        })

        io.on('connection', (socket) => {
            console.log("User connected");
      
            socket.on('userConnected', (userId) => {
              connectedUsers[userId] = socket.id;
              console.log(connectedUsers);
            });

            // like post
            socket.on('likePost',async(data)=>{
              const {currentUser,AuthorID,threadID} = data
              try {
                const post = await HandleLike(threadID,currentUser)
         
                const likesCount = post.likes.length;
            
                post.likesCount = likesCount;
            
                await post.save();
            
                if(currentUser !== AuthorID){
                 Notify.NotifyUser(AuthorID,currentUser,"Liked your post",threadID,"newNotification")
                }

                const isLikedByCurrentUser = post.likes.map(id => id.toString()).includes(currentUser);
            
                io.emit('postLiked', { postId: post._id, likesCount: post.likesCount,isLikedByCurrentUser,currentUser });
              } catch (error) {
                console.log(error);
              }
            
            })

            // Unlike post
            socket.on('unlikePost',async(data)=>{

              try {
                const {threadID,currentUser} = data

                const post = await HandleUnlike(threadID,currentUser)
  
                const isLikedByCurrentUser = post.likes.map(id => id.toString()).includes(currentUser);
           
                io.emit('postUnliked', { postId: post._id, likesCount: post.likesCount,isLikedByCurrentUser,currentUser });
              } catch (error) {
                console.log(error);
              }
             
            })

            // following user
            socket.on('follow',async(data)=>{
               const {currentUser,theOneBeingFollowed} =data
              try {
                const result = await HandleFollow(theOneBeingFollowed,currentUser)

                Notify.NotifyUser(result.thefollowed,result.thefollowing,"Started following you",null,"newNotification")
                
                io.emit('follow', {currentUser,isFollowing:true});
              } catch (error) {
                console.log(error);
              }
            })

            // unfollowing a user
            socket.on('unfollow',async(data)=>{
              const {currentUser,theOneBeingUnfollowed} = data
              
              try {

                await HandleUnFollow(currentUser,theOneBeingUnfollowed)

                io.emit('follow', {currentUser,isFollowing:false});
              } catch (error) {
                
              }
            })
      
            socket.on('disconnect', () => {
              for (let userId in connectedUsers) {
                if (connectedUsers[userId] === socket.id) {
                  delete connectedUsers[userId];
                  break;
                }
              }
              console.log('A user disconnected');
            });
          });
      
          return io;
    },
    getIo:()=>{
        if(!io){
            throw new Error("Io not initialied")
        }
        return io
    },
    getConnectedUser:()=>{
         return connectedUsers
    }
}