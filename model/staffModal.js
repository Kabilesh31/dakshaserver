const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    minLength: 3,
  },

  type: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: [true, "Please Provide Your Email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please Provide a Valid Email"],
  },

  mobile: {
    type: String,
    required: [true, "Please provide mobile number"],
    unique: true,
    match: [/^[6-9]\d{9}$/, "Please provide valid mobile number"],
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // important: hide password in queries
  },

  staffStatus: {
    type: String,
    default: "active",
  },

  dutyStatus: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },

  createdBy: {
    type: String,
  },

  staffCode: {
    type: String,
  },

  bloodGroup: {
    type: String,
  },

  img: {
    type: String,
  },

  documents: [
    {
      filename: String,
      url: String,
      public_id: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  isDeleted: {
    type: Boolean,
    default: false,
  },
  attendance: {
  type: Boolean,
  default: null
},

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

staffSchema.pre("save", async function (next) {
 
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});


module.exports = mongoose.model("Staff", staffSchema);