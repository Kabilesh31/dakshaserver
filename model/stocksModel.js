const mongoose = require("mongoose")

const stockSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:[true,"Please Enter Product Name"],
      },

      productCode:{
        type: String,
        required:[true,"Please Enter Product Code"],
      },
      
    stock: {
        type:Number,
        required:[true,"Please Enter Stock"],
    },
   
    stockIn:{
      type: Number,
      required:[true,"Please Enter Stock In"],
    },
    value : {
        type: Number,
        required:[true,"Please Enter Value"],
    }

})

module.exports = mongoose.model("Stock", stockSchema)