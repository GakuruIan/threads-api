const Posts = require('./../models/Posts')
const User = require('./../models/Users')
const Comment = require('./../models/Comments')

// creating thread post
exports.CreatePost =async(req,res)=>{

   const {author,caption} = req.body
   let uploaded_photos = []

   if(req.files){
       for (let file in req.files){
            let photo = new Object()

            photo.filename = req.files[file].filename
            photo.path =req.files[file].path

            uploaded_photos.push(photo)
       }
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

exports.FetchPosts=async(req,res)=>{
   
  try {
    let posts = await Posts.find().populate('author','username avatar _id')
     
    res.status(200).json(posts)
  }
  catch(err){
    res.status(500).json(err)
  }
}

exports.FetchPost=async(req,res)=>{
    const postID = req.params.id
    let isFollowing
    try {
      
      const post = await Posts.findById(postID).populate('author','username avatar _id')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar _id' 
        }
      })

      if(req.user){
       
         const user = await User.findById(req.user.id)
         
          isFollowing = user.following.includes(post.author._id)
       }

      res.status(200).json({post,isFollowing})
    } catch (error) {
      console.log(error)
      res.status(500).json(error)
    }

}

exports.CreateComment=async(req,res)=>{
      const postID = req.params.threadID
      const {comment,author} = req.body

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
     
        res.status(200).json({message:"Comment Added Successfully"})
      } 
      catch (error) {

        console.log(error)
         res.status(500).json(error)
      }

}

exports.LikeThread=async(req,res)=>{

   try {
    const postID = req.params.id
    const userID = req.user.id

   await Posts.findOneAndUpdate({_id:postID},
       {$push:{likes:userID}},
       {new:true,useFindAndModify:false}
    ) 

    res.status(200).json({message:"Liked successfully"})
   } catch (error) {

    console.log(error)
      res.status(500).json({message:error})
   }
}