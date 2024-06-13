const mongoose = require('mongoose')

const Comment = require('./Comments')

const postSchema = new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user',
        foreign_key: "_id",
        is_list: false,
    },
    caption:{
        type:String,
    },
    photos:[
        {
            path:{
                type:String,
            },
            public_id:{
                type:String
            }
        }
    ],
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ],
    likesCount:{
        type:Number,
        required:true,
        default:0
    },
    shares:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ],
    comments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:Comment,
            foreign_key: "_id",
            is_list: true,
        }
    ]
},{timestamps:true})

postSchema.pre('deleteOne',async function(next){
    try {
        const postID = this._id

        await mongoose.model('Comment').deleteMany({ post: postID });
        
        const post = await mongoose.model('Posts').findById(postID).exec();
        if (post) {
            await mongoose.model('user').updateOne({ _id: post.author }, { $pull: { posts: postID } });
        }
        
    } catch (error) {
        
    }
})

module.exports = mongoose.model('Posts',postSchema)