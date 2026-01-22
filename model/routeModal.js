const mongoose = require("mongoose")

const routeSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Route", routeSchema);