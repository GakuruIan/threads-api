
const Posts = require('./../models/Posts')

// 
exports.CreatePost =async(req,res)=>{

    const {author,caption,photos,likes,shares,comments} = req.body

   try {
    const newPost =new Posts({
        author,
        caption,
        photos,
        likes,
        shares,
        comments
    })

    newPost.save()

    res.status(200).json({message:"Post created successfully"})

   } catch (err) {
     res.status(500).json(err)
   }
}