const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

const users = require('./../models/Users')


module.exports = function(passport){
    passport.use(new LocalStrategy(
        function(username,password,done){

            users.findOne({username})
            .then((user)=>{
                if(!user){
                    return done(null,false,{message:"Invalid Credentials"})
                }

                bcrypt.compare(password,user.password,(err,isMatch)=>{
                    if(err){
                        throw err
                    }

                    if(isMatch){
                       return done(null,user)
                    }
                    else{
                        return  done(null,false,{message:"Invalid Credentials"})
                    }
                })

            })
            .catch((err)=>{
                 return done(err)
            })

        }
    ))

    passport.serializeUser((user,done)=>{
        done(null,user.id)
    })

    passport.deserializeUser((id,done)=>{
        users.findById(id)
        .then((user)=>done(null,user))
        .catch((err)=>console.log(err))
    })
}

