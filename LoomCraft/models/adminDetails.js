const mongoose = require('mongoose');


const loginschema = new mongoose.Schema({
    // name: {
    //     type : String,
    //     required : true
    // },
    username: {
        type : String,
        required : true
    },
    email: {
        type : String,
        required : true
    },
    mobile: {
        type : Number,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    is_verified:{
        type: Boolean
    },
    status:{
        type: String,
        default:false,
        required:true
    },
    created_at:
    {
        type: Date,
        required:true
    }
    
})

const adminCollection = new mongoose.model("admins",loginschema);


module.exports = adminCollection