const mongoose = require("mongoose");

const customerActivitySchema = new mongoose.Schema({
  customerId: {
    type: String,
    required: [true, "activity Id required"],
  },

  activityStatus: {
    type: Boolean,
    required: [true, "Status is Required"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("customerActivity", customerActivitySchema);
