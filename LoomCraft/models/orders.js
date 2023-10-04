const mongoose = require("mongoose");
const userModel = require('./userDetails');
const productModel = require('./productDetails')


const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: userModel
    },
    // name: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: userModel
    // },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: userModel
    },
    status: {
        type: String,
        default: "Processing"
    },
    orderCancleRequest: {
        type: Boolean,
        default: false
    },
    orderReturnRequest: {
        type: Boolean,
        default: false
    },
    products: [{
        p_name: {
            type: String,
            required: true
        },
        realPrice: {
            type: Number,
           
        },
       

        price: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        images: [{
            type: String,
            required: true
        }],
        category: [{
            type: String,
            required: true
        }],
        size: {
            type: String,
            require: true
        },
        color: {
            type: String,
            require: true
        },
        quantity: {
            type: Number,
            // default:1,
            require: true
        },
        productStatus:{
            type: Boolean,
            default : true
        }
    }],
    Totalprice:{
        type: Number,
        required: true  
    },
    Discountprice:{
        type: Number,
        required: true   
    },
    payment: {
        method: {
            type: String,
        },
        amount: {
            type: String,
        }
    },
    // proCartDetail: {
    //     type: Array
    // },
    // cartProduct: {
    //     type: Array
    // },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now()
    },
    expectedDelivery: {
        type: Date,
    }
});

const orderModel = mongoose.model('order', orderSchema);
module.exports = orderModel;
