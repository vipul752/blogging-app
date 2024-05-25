const mongoose = require('mongoose');


mongoose.connect("mongodb+srv://vipul1:vipul123@authapp.hz2n5r9.mongodb.net/mini-project")
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    like:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"user"
    }
   
},{timestamps:true})

module.exports = mongoose.model("Post",postSchema);