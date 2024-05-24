const jwt = require('jsonwebtoken')

const VerifyToken=(req,res,next)=>{
     const token =req.header('Authorization').split(' ')[1]

     if(!token){
        res.status(401).json({message:'Access Denied'})
     }

     try {
        const verified = jwt.verify(token,'secret')
        req.user = verified

        next()
     } catch (error) {
        res.status(401).json({message:'Invalid Token'})
     }
}


module.exports = VerifyToken