const mongoose = require('mongoose')
const Joi  =require('joi')

const postSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        minlength:5,
        maxlength:100,
        
    },
    imgUrl:{
        type: String,
        required:true,

    },
    description: {
        type: String,
        required: true,
        minlength:5,
        maxlength:1000
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
}, {timestamps:true})

const Post = mongoose.model("Post", postSchema)

function validatePost(post) {
    const schema = Joi.object({
        title: Joi.string().min(5).max(100).required(),
        imgUrl: Joi.string().required(),
        description: Joi.string().min(5).max(1000).required(),
        
    });

    return schema.validate(post);
}

module.exports.Post = Post;
module.exports.validate = validatePost;