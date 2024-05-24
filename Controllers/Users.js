const bcrypt = require('bcryptjs')
const user = require('../models/Users')
const path = require('path')
const passport = require('passport')
const jwt = require('jsonwebtoken')

const Cloudinary = require('../Services/Cloudinary')
const DatauriParser = require('datauri/parser');

const parser = new DatauriParser();

exports.Register =async(req,res)=>{
    const {username,email,bio,password} = req.body
    let image ;
    let result ;
    if(req.file){
        const image_parser = parser.format(path.extname(req.file.originalname).toString(),req.file.buffer);
        image = image_parser.content

        try {
            result = await Cloudinary.uploader.upload(image,{
                folder:"Profile"
            })

        } catch (error) {
            res.status(500).json({"message":"Profile not uploaded!"})
        }

    }

    try {
        const NewUser = new user({
            username,
            email,
            bio,
            password,
            avatar:{
                public_id:result.public_id,
                url:result.url,
                folder:result.folder
            }
        })
    
    
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(NewUser.password,salt,(err,hash)=>{
                if(err) throw err
    
                NewUser.password = hash
    
                try {
                    NewUser.save()
                    res.status(200).json({"message":"success"})
                } catch (error) {
                    res.status(500).json({error})
                }
            })
        })

    } catch (error) {
        res.status(500).json({error})
    }
   
}


exports.Login=async(req,res,next)=>{

    passport.authenticate('local',{session:false},(err,user,info)=>{
        if(err){
           return res.status(500).json({message:"Internal Server Error"})
        }

        if(!user){
           return res.status(401).json({message:info.message})
        }

        jwt.sign({id:user._id},'secret',(err,accessToken)=>{
            if(err){
                res.status(401).json({message:"Failed Login",accessToken:null})
             }

             const {password ,...userInfo} = user._doc
          
             res.status(200).json({...userInfo,accessToken})
        })
    })(req,res,next)
}

exports.GetMe =async(req,res)=>{
     const id = req.params.id

     try {
      const result =  await  user.findById(id,{username:1,email:1,avatar:1})

      res.status(200).json(result)

     } catch (error) {
        res.status(500).json(error)
     }
}

exports.GetUser=async(req,res)=>{
  const username = req.params.username

  try {
    const User = await user.findOne({username},{username:1,bio:1,following:1,followers:1,avatar:1}).populate('posts')

    const data={
        username: User.username,
        bio: User.bio,
        following: User.following.length,
        followers: User.followers.length,
        avatar: User.avatar,
        posts: User.posts.length
    }

    res.status(200).json(data)
  } catch (error) {
    res.status(500).json(error)
  }
}  

exports.GetUserThreads=async(req,res)=>{
     const username = req.params.username

     try {
        const result = await user.findOne({username},{username:1,avatar:1}).populate('posts')

        const data = {
            author:{
                username:result.username,
                avatar:result.avatar
            },
            posts:result.posts
        }

        res.status(200).json(data)
     } catch (error) {
         res.status(500).json(error)
     }
}

exports.FindUser=async(req,res)=>{
    const {search} = req.body
    
    try {
        let users = await user.find({ username: { $regex: search, $options: 'i' } },{username:1,avatar:1});

        res.status(200).json(users)
    } catch (error) {
         res.status(500).json(error)
    }
}