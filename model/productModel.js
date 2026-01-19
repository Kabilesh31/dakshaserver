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
    value:{
      type: Number,
      required:true  
    },
    category:{
      type: String,
      required:true
    },
    description: {
        type: String,
        required:true
    },
    file: Buffer,
    createdBy: {
      type : String
    },
    updatedPrice : {
      type : Number
    }
})

module.exports = mongoose.model("Product", productSchema)