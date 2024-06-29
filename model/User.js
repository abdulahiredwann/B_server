const mongoose = require('mongoose')
const Joi  =require('joi')
const jwt = require('jsonwebtoken')



const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        minlength: 3,
        maxlength:50,

    },
    email:{
        type:String,
        required:true,
        minlength:5,
        maxlength:50
    },
    password:{
        type:String,
        required:true,
        minlength:5,
        maxlength:1024
    },
    profilePicture: {
        type:String,
        required: true
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }]
})
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, process.env.jwtPrivateKey);
    return token;
};

const User = mongoose.model("User", userSchema)



function validateUser(user){
    const schema = Joi.object({
        name:Joi.string().min(3).max(50).required(),
        email:Joi.string().min(5).max(50).required(),
        password:Joi.string().min(6).max(50).required(),
        profilePicture:Joi.string().required()
    })
    return schema.validate(user)
}

exports.validate = validateUser
exports.User = User

