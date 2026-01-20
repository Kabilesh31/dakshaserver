const mongoose = require("mongoose")
const validator = require("validator");
const staffSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true,"Please Enter Your Name"],
        minLength: 3
    },
    type:{
      type: String,
      required:true  
    },
    email:{
        type:String,
        required:[true,"Please Provide Your Email"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail, "Please Provide a Valid Email"]
    },
    staffStatus: {
      type:String,
      default: 'active'
    },
    createdBy: {
      type : String
    },
    staffCode : {
      type  : String,
    },
    createdAt:{
        type: Date,
        default: Date.now 
    },
    isDeleted : {
        type: Boolean,
        default: false
    },
    img : {
        type : String
    },
   documents: [
      {
        filename: { type: String },      
        url: { type: String },             
        public_id: { type: String },       
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

})

module.exports = mongoose.model("Staff", staffSchema)
