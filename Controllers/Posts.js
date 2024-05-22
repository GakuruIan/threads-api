
const Posts = require('./../models/Posts')
const User = require('./../models/Users')

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