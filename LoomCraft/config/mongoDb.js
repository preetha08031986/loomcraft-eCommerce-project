var mongoose = require('mongoose');
const { db } = require('../models/orders');

mongoose.connect("mongodb://127.0.0.1:27017/ecommerce")
.then(()=>{
  console.log("Mongodb Connected");
}).catch(()=>{
  console.log("Connection Failed");
})
module.exports = db