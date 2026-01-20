const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    productName: {
        type:String,
        required:[true,"Please Enter Your Name"],
        minLength: 3
    },
    productCode:{
      type:String,
      required:true
    },
    brand :{
      type :  String,
      required : true,
    },
    value : {
      type : Number,
      required : true
    },
    boxPacking : {
      type : Boolean,
      required : false
    },
    ptr1 : {
      type : Number
    },
    ptr2 : {
      type : Number
    },
    ptr3 : {
      type : Number
    },
    notes : {
      type : String
    },
    img : {
      type : String
    },
    createdBy: {
      type : String
    },
    createdAt : {
      type : Date,
      default : Date.now
    },
    isDeleted : {
      type : Boolean,
      default : false
    }
})

module.exports = mongoose.model("Product", productSchema)