const mongoose = require("mongoose")
const customerSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true,"Please Enter Customer Name"],
        minLength: 3
    },
    phone:{
      type: Number,
      required:true  
    }, 
    phone2:{
        type: Number,
        required:true  
    },
    address:{
      type: String,
      required:true
    },
    routeName:{
        type: String,
      },
    routeId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Route"
}
,
    lineNo: {
  type: Number,
  default: 0,
}
,
    creditDays : {
      type : Number
    },
    pincode:{
        type: Number,
    },
    geoLocation : {
      lat : {
        type : String
      },
      long : {
        type : String
      }
    },
    isDeleted : {
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
    img : {
      type : String
    },
    category : {
     type : String 
    },
    status : {
        type: Boolean,
        default: true
    },
})
module.exports = mongoose.model("Customer", customerSchema)
