const Notification  = require('./../models/Notification')
const mongoose = require('mongoose');


exports.GetNotifications=async(req,res)=>{

    const userID = new mongoose.Types.ObjectId(req.user.id)
    try {
        const Notifications = await Notification.aggregate([
            {
                $match:{ UserToNotify:userID}
            },
            {
                $addFields:{
                    date:{
                        $dateToString:{
                            format:"%d-%m-%Y",
                            date:"$createdAt"
                        }
                    }
                }
            },
            {
                $lookup:{
                    from:'users',
                    localField:'notifier',
                    foreignField:'_id',
                    as:'notifier'
                }
            },
            {
                $unwind: "$notifier"
            },
            {
                $lookup:{
                    from:'posts',
                    localField:'post',
                    foreignField:'_id',
                    as:'post'
                }
            },
            {
                $unwind: "$post"
            },
            {
                $project:{
                    date:1,
                    message:1,
                    createdAt:1,
                    read:1,
                    notifier:{
                        username:1,
                        avatar:1,
                        _id:1
                    },
                    post:{
                        _id:1,
                        photos:1,
                    }
                }
            },
            {
                $group:{
                     _id:"$date",
                    notifications:{
                        $push:{
                            _id:"$_id",
                            message:"$message",
                            read:"$read",
                            createdAt:"$createdAt",
                            notifier:"$notifier",
                            post:"$post"
                        }
                    }
                }
            },
            {
                $sort:{_id:1}
            }
        ])

        res.status(200).json(Notifications)
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.UpdateNotification=async(req,res)=>{
    try {
        const id = req.params.id

        const read = req.body.read

       const found= await Notification.findByIdAndUpdate({_id:id},
            {read},
            {new: true, useFindAndModify: false}
        )

        if(!found){
            res.status(404).json({message:"notification not found"})
        }


        res.status(200).json({message:'success'})
    } catch (error) {
        
        res.status(500).json(error)
    }
}

