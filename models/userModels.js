const mongoose = require('mongoose');


mongoose.connect("mongodb+srv://vipul1:vipul123@authapp.hz2n5r9.mongodb.net/mini-project")
const userSchema = new mongoose.Schema({
    username:String,
    password:String,
    email:String,
    age:Number,
    name:String,
    posts :[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    }]
})

module.exports = mongoose.model("User",userSchema);