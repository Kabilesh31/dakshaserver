const mongoose = require("mongoose");

const vehicleSchama = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  makeYear: {
    type: Number,
    required: true,
  },
  insuranceExpiry: {
    type: String,
  },
  fcUpto: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Vehicle", vehicleSchama);
