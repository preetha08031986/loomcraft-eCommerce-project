const mongoose =require('mongoose');

const couponSchema = new mongoose.Schema({
    
     couponName:{
        type:String,
        require:true,
        unique: true
     },
    
     percentage:{
        type:Number,
        require:true
     },
     expiryDate:{
        type:String,
        require:true
     },
     
     minValue:{
        type:Number,
        require:true
     }
});

const couponModel  = mongoose.model('coupon',couponSchema);
module.exports = couponModel;