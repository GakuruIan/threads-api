const Notification = require('../models/Notification')
const User = require('../models/Users')

const {getIo,getConnectedUser} = require('../Utils/Socket')

exports.NotifyUser=async(UserToNotify,notifier,message,postID,type)=>{
    const io = getIo()
    const Connectedusers = getConnectedUser()
    
    
    const  notification = new Notification({UserToNotify,notifier,message,post:postID})
    
    try {
        const savedNotification = await notification.save()

        await User.findByIdAndUpdate({_id:UserToNotify},
            {$addToSet:{notifications:savedNotification._id}},
            {new:true,useFindAndModify:false}
        )

        if(Connectedusers[UserToNotify]){

            const notification = await Notification.findById(savedNotification._id,{message:1})
            .populate('notifier','username  _id')

           

            if(type === 'newNotification'){
                io.to(Connectedusers[UserToNotify]).emit(type,notification)
            }
            else{
                io.to(Connectedusers[UserToNotify]).emit(type,notification)
            }
        } 
  }
  catch(error){
     console.log(`message error ${error}`)
  }
}

// module.exports = NotifyUser