const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productID:{
      type:String,
    },
    p_name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    originalprice: {
        type: Number,
        required: true
    },
    productStock: {
        type: Number,
    
      },
      productOffer: {
        type: String,
        required: true,
      },
    category: {
        type: String,
        required:true
      },
      disc_Amount:{
        type: String,
        require: true,
      },
    color: {
        type: String,
        required: true
    },
    images:[{
        type: String,
        require: true
      }],
    
    
    // finalPrice:{
    //     type:Number
    // },
    description: {
        type: String,
        required: true
    },
    addedby: {
        type: String,
        required: true
    },
   
    
    availability: {
        type: Boolean,
        require: true,
        default:true
        
    }
})

const productCollection = new mongoose.model("products", productSchema);


module.exports = productCollection;