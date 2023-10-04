const mongoose = require('mongoose');
const productModel = require('./productDetails')
const categoryModel = require('./categoryDetails')
const offerSchema = new mongoose.Schema({
    categoryOfferID :{
        type : String,
        require : true
    },
    
    categoryID : {
        type : String,
        require : true
    },
    offerTitle : {
        type : String,
        require : true
    },
    offerCategory:{
        type:String,
        require:true,
        
     },
     expiryDate : {
       type : String,
       reqire : true
     },
     percentage : {
        type : Number,
        require : true
     },

     minValue : {
        type : Number,
        require : true
    },
    availability: {
        type: Boolean,
        require: true,
        default:false
        
    }


});

 const offerModel = mongoose.model('offer',offerSchema)
 module.exports = offerModel