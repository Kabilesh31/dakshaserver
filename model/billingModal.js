const mongoose = require("mongoose")

const billingSchema = new mongoose.Schema({
    orderId:{
        type:String,
        required:true
    },
    invoiceNo : {
        type: String,
    },
    customerName: {
        type:String
    }, 
    session:{
        type: String,
        required:true
    },
    phone:{
        type:Number,
    },
    productName: {
        type:[String],
        required:[true,"Product Name Missing"],
    },
    productCode:{
        type:[String],
        required:true
    },
    createdBy:{
        type:String
    },
    createdAt:{
        type: Date,
        default: Date.now 
    },
    totalAmount:{
        type:Number,
        required: [true,"Total Amount is Missing"]
    },
    value:{
        type: [Number],
        required:[true,"Quantity Missing"],
    },
    quantity:{
        type: [Number],
        required:[true,"Quantity Missing"],
    },
    isPaid : {
        type : Boolean,
        default: false
    },
    fromDate : {
        type : String
    },
    toDate : {
        type : String
    },
    isGenerated : {
        type : Boolean,
        default: false
    },
    gstPercentage : {
        type : Number
    }, 
    gst : {
        type : Boolean
    }

})

module.exports = mongoose.model("Bill", billingSchema)