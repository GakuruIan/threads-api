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

    try {
      
      const posts = await Posts.findById(postID).populate('author','username avatar _id')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar _id' 
        }
      })

      res.status(200).json(posts)
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