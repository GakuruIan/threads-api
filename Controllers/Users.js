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
                folder:`Profile/${username}`
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

    passport.authenticate('local',(err,user,info)=>{
        if(err){
           return res.status(500).json({message:"Internal Server Error"})
        }

        if(!user){
           return res.status(401).json({message:info.message})
        }
        
        req.session.userId =user._id

        jwt.sign({id:user._id},'secret',(err,accessToken)=>{
            if(err){
                res.status(401).json({message:"Failed Login",accessToken:null})
             }

             const {password ,...userInfo} = user._doc
          
             res.status(200).json({...userInfo,accessToken})
        })
    })(req,res,next)
}

exports.Logout=async(req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }

        req.session.destroy(err => {
            if (err) {
              return res.status(500).json({ message: 'Logout failed. Please try again.' });
            }
            
            // Clear the session cookie
            res.clearCookie('connect.sid'); 
            res.status(200).json({ message: 'Logout successful.' });
          });
      });
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
    const User = await user.findOne({username},{_id:1,email:1,username:1,bio:1,following:1,followers:1,avatar:1}).populate('posts')

    const data={
        _id:User._id,
        email:User.email,
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
        const result = await user.findOne({username},{_id:1,username:1,avatar:1}).populate('posts')

        const data = {
            author:{
                username:result.username,
                avatar:result.avatar,
                _id:result._id
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

exports.HandleFollow=async(req,res)=>{
    const {theOnebeingFollowed} = req.body

    const theOneFollowing = req.user.id

     try {
        await user.findOneAndUpdate({_id:theOnebeingFollowed},
          {$push:{followers:theOneFollowing}},
          {new: true, useFindAndModify: false}   
        )

        await user.findOneAndUpdate({_id:theOneFollowing},
            {$push:{following:theOnebeingFollowed}},
            {new: true, useFindAndModify: false}   
          )
        
          res.status(200).json({message:"success"})
     } catch (error) {
        res.status(500).json(error)
     }
}

exports.HandleUnFollow=async(req,res)=>{
    const {theOnebeingUnFollowed} = req.body
    
    const theOneFollowing = req.user.id
    try {

        await user.findOneAndUpdate({_id:theOnebeingUnFollowed},
            {$pull:{followers:theOneFollowing}},
            {new: true, useFindAndModify: false}   
          )

          await user.findOneAndUpdate({_id:theOneFollowing},
            {$pull:{following:theOnebeingUnFollowed}},
            {new: true, useFindAndModify: false}   
          )
          res.status(200).json({message:"success"})
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.UpdateProfile=async(req,res)=>{
    const ID = req.user.id

    const {email,username,bio,currentImage} = req.body

    let newImage
    
      try {

        if(req.file){
            if(currentImage.public_id){
                await Cloudinary.uploader.destroy(currentImage.public_id)
               }
        
               const image_parser=parser.format(path.extname(req.file.originalname).toString(),req.file.buffer);
               const image = image_parser.content;
    
               newImage = await Cloudinary.uploader.upload(image,{
                 folder:"Profile"
               })
        }

        const updateData = {
            email,
            username,
            bio,
        }

        if(newImage){
            updateData.avatar = {
                public_id:newImage.public_id,
                url:newImage.url,
                folder:newImage.folder
            }
        }

        const updatedUser = await user.findOneAndUpdate({_id:ID},updateData,{ new: true })
       
        res.status(200).json({ message: "User updated successfully",user:updatedUser });
      } 
      catch (error) {
          res.status(500).json(error)
      }
    
}

exports.HandleDelete=async(req,res)=>{
     const ID = req.user.id

     try {
        const User = await user.findById(ID)

        await Cloudinary.api.delete_resources_by_prefix(`Profile/${User.username}`)

        await Cloudinary.api.delete_resources_by_prefix(`Threads/${User.username}`)

         if(!User){
            res.status(404).json({message:'No user found'})
         }

         await Cloudinary.api.delete_folder(`Profile/${User.username}`)

         await User.deleteOne()

         this.Logout(req,res)

         res.status(200).json({message:'Account deleted successfully!!'})
     } catch (error) {

        console.log(error)
         res.status(500).json(error)
     }
    
}