const mongoose = require("mongoose")
const customerSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true,"Please Enter Customer Name"],
        minLength: 3
    },
    email:{
      type:String,
    },
    phone:{
      type: Number,
      required:true  
    }, 
    phone2:{
        type: Number,
        required:true  
    },
    location:{
      type: String,
      required:true
    },
    address:{
      type: String,
      required:true
    },
    district:{
        type: String,
      },
    state:{
        type: String,
      },
    pincode:{
        type: String,
    },
    type:{
        type: String,
        required:true
      },
    isDelete : {
        type: Boolean,
        default: false
    },
    createdBy: {
      type : String
    },
    createdAt : {
      type : Date,
      default : Date.now
    },
    staff: {
      type: String,
      required : true
    },
    deactivatedAt: {
      type : Date,
      default : null
    },
    status : {
        type: Boolean,
        default: true
    },
    statusActivity: {
        type: [String]
    },
    paymentPending : {
        type : Boolean,
        default : false
    },
    billUpdateAt : {
      type : Date
    },
    gst : {
      type : String,
      default : "withoutgst"
    }
})
module.exports = mongoose.model("Customer", customerSchema)
