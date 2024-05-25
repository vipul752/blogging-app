const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

mongoose.connect("mongodb+srv://vipul1:vipul123@authapp.hz2n5r9.mongodb.net/mini-project")
const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required:true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    like:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
         }
    ]
   
},{timestamps:true})

module.exports = mongoose.model("post",postSchema);