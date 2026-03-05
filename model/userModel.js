const mongoose = require("mongoose")
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")


const userSchema = new mongoose.Schema({
    
    name:{
        type:String,
        required:[true,"Please Enter Your Name"],
        minLength: 5
    },
    phone:{
        type: Number,
        required: true,
    },email:{
        type:String,
        required:[true,"Please Provide Your Email"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail, "Please Provide a Valid Email"]
    },role:{
        type:String,
        required:[true, "Role is Missing"]
    },
    //  role:{
    //     type:String,
    //     required:[true,"Please Provide Company Name"],
    //     minLength: 2
    // },
    // companyName:{
    //     type:String,
    //     required:[true,"Please Provide Company Name"],
    //     minLength: 2
    // },
    // companyYear:{
    //     type:Number,
    //     required:[true,"Please Provide Company Year"],
    //     minLength: 1
    // },
    // gstNumber:{
    //     type:String,
    //     required:[true,"Please Provide GST Number"],
    //     minLength: 2
    // },
    // address:{
    //     type:String,
    //     minLength: 10
    // },
    // userAddress1:{
    //     type:String
    // },
    // userAddress2:{
    //     type:String
    // },
    createdBy:{
        type:String,
        required:[true],
        minLength: 2
    },
    status:{
        type:String,
    },
    password:{
        type:String,
        required:[true,"Please Provide a Password"],
        minlength: 8,
    },
    confirmPassword :{
        type:String,
        required:[true,"Please Confrim Your Password"],
        validate:{
            validator : function(el){
                return el === this.password
            },
            message: "Password is Didnt Match"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken : String,
    passwordResetTokenExpires: Date,
    sessionToken: {
        type: String,
        default: null
    }
})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
})

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this. passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10)
        
        return JWTTimestamp < changedTimestamp
    }
    return false
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString("hex")
    this.passwordResetToken = crypto 
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")
    // console.log({resetToken}, this.passwordResetToken)
    const expireTime = Date.now() + 10 * 60000
    this.passwordResetTokenExpires = expireTime
    return resetToken;
}

module.exports = mongoose.model("User", userSchema)