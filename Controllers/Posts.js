const Posts = require('./../models/Posts')
const User = require('./../models/Users')
const Comment = require('./../models/Comments')

const cloudinary = require('./../Services/Cloudinary')

const Notify = require('../Utils/NotifyUser')

// creating thread post
exports.CreatePost =async(req,res)=>{

   const {author,caption} = req.body
   let uploaded_photos = []

   if(req.files){

      req.files.forEach((file) => {
        let photo = {
            filename: file.originalname,
            path: file.path,
            public_id: file.filename, 
        };

        uploaded_photos.push(photo);
    });
   }


   try {
    const newPost =new Posts({
        author,
        caption,
        photos:uploaded_photos,
    })

    await newPost.save()

    await User.findOneAndUpdate({_id:author},
     {$push:{posts:newPost._id}},
     {new: true, useFindAndModify: false}
    )

    res.status(200).json({message:"Post created successfully"})

   } catch (err) {
     res.status(500).json(err)
   }
}

exports.DeleteThread=async(req,res)=>{
   const postID = req.params.id

   try {
      const post = await Posts.findById(postID)

      if(!post){
        res.status(404).json({message:"Post not found"})
      }

     const deletePhotos = post.photos.map((photo)=>{
        return cloudinary.uploader.destroy(photo.public_id) 
      })
     
      await Promise.all(deletePhotos)

      await post.deleteOne()

      res.status(200).json({message:"Post deleted successfully"})
   } catch (error) {
      res.status(200).json(error)
   }
}

exports.FetchPosts=async(req,res)=>{
   const userID = req.user.id
   
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 15;
   const skip = (page - 1) * limit;

  try {
    let posts = await Posts.find()
    .sort({createdAt:-1})
    .skip(skip)
    .limit(limit)
    .populate('author','username avatar _id')
    .lean()

    const totalPosts = await Posts.countDocuments();


    posts.forEach(post => {
      post.isLikedByCurrentUser = post.likes.map(id => id.toString()).includes(userID);
    });
    


    res.status(200).json(
      {
        posts,
        totalPages: Math.ceil(totalPosts / limit)
    })
  }
  catch(err){
    res.status(500).json(err)
    console.log(err)
  }
}

exports.FetchPost=async(req,res)=>{
    const postID = req.params.id
    let isFollowing
    try {
      
      let post = await Posts.findById(postID)
      .populate('author','username avatar _id')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar _id' 
        }
      })
      .lean()

      if(req.user){
          const user = await User.findById(req.user.id)
          isFollowing = user.following.includes(post.author._id)
       }

       post.isLikedByCurrentUser = post.likes.map(id => id.toString()).includes(req.user.id);
       
      res.status(200).json({post,isFollowing})
    } catch (error) {
      console.log(error)
      res.status(500).json(error)
    }

}

exports.CreateComment=async(req,res)=>{
      const postID = req.params.threadID
      const {comment,author,ownerOfPost} = req.body

      try {

        const newComment = new Comment({
            comment,
            post:postID,
            author
        })

        await newComment.save()

        await User.findOneAndUpdate({_id:author},
          {$push:{comments:newComment._id}},
          {new: true, useFindAndModify: false}
         )

         await Posts.findOneAndUpdate({_id:postID},
          {$push:{comments:newComment._id}},
          {new: true, useFindAndModify: false}
         )

         if(ownerOfPost !== author){
           Notify.NotifyUser(ownerOfPost,author,"Commented on your post",postID,'newComment')
         }
     
        res.status(200).json({message:"Comment Added Successfully"})
      } 
      catch (error) {

        console.log(error)
         res.status(500).json(error)
      }

}


