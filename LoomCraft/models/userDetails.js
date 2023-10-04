const mongoose = require('mongoose');
const productDetails=require('./productDetails')
const userSchema = new mongoose.Schema({
    
    username : {
        type : String,
    },
    email : {
        type : String,
        required : true
    },
    phone: {
        type: Number,
        required: true
    },
    password : {
        type : String,
        required : true
    },
    is_verified:{
        type: Boolean,
        default:false,
        required: true
    },
    status:{
        type: Boolean,
        default:false,
        require:true
    },
    created_at:
    {
        type: Date,
        required:true
    },
    referralCode : {
        type: String,
        required:true,
        unique : true
    },
    referedBy : {
        type: String,
        
    },
    cart: 
        [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: productDetails
            },
            prod_ID: {
                type: String,
              },
            p_name:{
                type: String,
            },
            quantity  : {
                type: Number
                
            },
            productStock: {
                type: Number,
                default:1
              },
            originalprice: {
                type: Number,
            },
            
           
            price: {
                type: Number,
                require: true
            },
            // totalPrice:{
            //     type:Number,
            // },
            couponDiscount:{
                type: Number
            },
            disc_Amount:{
                type: String,
                require: true,
              },
             images:{
                type: String,
                require: true,
             },
           
        
        }],
        totalPrice : {
            type : Number,
            default :0
        },

        wishlist: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: productDetails
            }
        }],
        walletBalance: {
            type : Number,
            default : 0
        },
        wallethistory: [
            {   
                process:{
                    type: String // Payment or TopUp or Refund
                },  
                amount: {
                    type:Number
                },
                date: {
                    type: Date,
                    default: Date.now
                }
            }
        ],

        address: [{
            name: {
                type: String,
                required: true
            },
            houseName: {
                type: String,
                required: true
            },
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            phone: {    
                type: Number,
                required: true
            },
            postalCode: {
                type: Number,
                required: true
            }
        }]
    }, { timestamps: true });
        
    


const usercollection = new mongoose.model("users",userSchema);

module.exports = usercollection;