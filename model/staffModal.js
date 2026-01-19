const mongoose = require("mongoose")
const validator = require("validator");
const staffSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true,"Please Enter Your Name"],
        minLength: 3
    },
    phone:{
      type: Number,
      required:true  
    },
    designation : {
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
    employeeId : {
      type  : Number,
      required: true
    },
    staffStatus: {
      type:String,
      default: 'active'
    },
    createdBy: {
      type : String
    },
    address : {
      type : String
    },
    staffId : {
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
    file: {
        type: Buffer
    },
    dob: {
      type: String,
      default : null
    },
    doj : {
      type :  String,
      default : null
    },
    blood : {
      type : String
    },
    aadhar : {
      type : Number
    },
    staffId : {
      type  : String,
      default: () => Math.floor(10000 + Math.random() * 90000).toString()
    },
    emergencyContact : {
      type  : Number,
      default : null
    },
    emergencyContact2 : {
      type  : Number,
      default : null
    },
    bankName : {
      type  : String
    },
    accountNo : {
      type  : Number,
      default : null
    },
    branch : {
      type  : String
    },
    ifsc : {
      type  : String
    },
    pan : {
      type  : String
    },
    family : {
      fatherName : {
      type  : String
    },
    motherName : {
      type  : String
    },
    siblingName : {
      type  : String
    },
    familyNumber : {
      type  : Number
    },
    familyMembers : {
      type  : Number
    },
    },
    education : {
      degree : {
        type  : String
      },
      universityName : {
        type  : String
      },
      degreeName1 : {
        type  : String
      }
      ,
      degreeName2 : {
        type  : String
      }
    },
    
  
    
    
    
    


})

module.exports = mongoose.model("Staff", staffSchema)
