
const Post = require('../models/Posts')
const user = require('../models/Users')


const HandleUnlike=async(threadID,currentUser)=>{
    try {
        const post=await Post.findByIdAndUpdate({_id:threadID},
            {$pull:{likes:currentUser}},
            {new:true}
          )
    
          const likesCount = post.likes.length;
    
          post.likesCount = likesCount;
    
         await post.save();
      
         return post
    } catch (error) {
        console.log(error);
    }
}

const HandleLike=async(threadID,currentUser)=>{
    try {
        const post = await Post.findOneAndUpdate({_id:threadID},
            {$addToSet:{likes:currentUser}},
            {new:true,useFindAndModify:false}
         ) 
     
         const likesCount = post.likes.length;
     
         post.likesCount = likesCount;
     
         await post.save();

         return post

    } catch (error) {
        console.log(error);
    }
}

const HandleFollow=async(theOnebeingFollowed,theOneFollowing)=>{

   try {
    const thefollowed = await user.findOneAndUpdate({_id:theOnebeingFollowed},
        {$push:{followers:theOneFollowing}},
        {new: true, useFindAndModify: false}   
      )

      const thefollowing = await user.findOneAndUpdate({_id:theOneFollowing},
          {$push:{following:theOnebeingFollowed}},
          {new: true, useFindAndModify: false}   
        )
    
    return {
        thefollowed:thefollowed._id,
        thefollowing:thefollowing._id
    }
    
   } catch (error) {
    console.log(error);
   }
}

const HandleUnFollow=async(theOneUnFollowing,theOnebeingUnFollowed)=>{

   try {
     const beingUnfollowed = await user.findOneAndUpdate({_id:theOnebeingUnFollowed},
        {$pull:{followers:theOneUnFollowing}},
        {new: true, useFindAndModify: false}   
      )

     const Unfollowing = await user.findOneAndUpdate({_id:theOneUnFollowing},
        {$pull:{following:theOnebeingUnFollowed}},
        {new: true, useFindAndModify: false}   
      )

      return{
        Unfollowing:Unfollowing._id
      }

   } catch (error) {
      console.log(error);
   }

}

module.exports = {HandleUnlike,HandleLike,HandleFollow,HandleUnFollow}