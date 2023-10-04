var mongoose = require('mongoose');
const { db } = require('../models/orders');

mongoose.connect("mongodb+srv://preethasurej20:UIOomNlScKJGQSL0@cluster0.0mcrzw0.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
  console.log("Mongodb Connected");
}).catch(()=>{
  console.log("Connection Failed");
})
module.exports = db