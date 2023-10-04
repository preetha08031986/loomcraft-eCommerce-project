const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
        
        categoryName :{
            type : String,
            unique:true,
            required : true
        },
        description: {
            type: String,
            required: true
          },
          isAvailable: {
            type: Boolean,
            default: true
        }  ,  
        // categoryImage:{
        //     type : String,
        //     required : true
        // },

       
        
})

 const categoryCollection = new mongoose.model("categories",categorySchema);


module.exports = categoryCollection;