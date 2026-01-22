const mongoose = require("mongoose");

const routeAssignmentSchema = new mongoose.Schema({
  date: {
    type: String, // "2026-01-22"
    required: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Staff collection
    ref: "Staff",
    required: true
  },
  routeId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Route collection
    ref: "Route",
    required: true
  },
  status: {
    type: String,
    enum: ["ASSIGNED", "IN_PROGRESS", "COMPLETED"],
    default: "ASSIGNED"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate route assignment per day
routeAssignmentSchema.index({ date: 1, routeId: 1 }, { unique: true });

module.exports = mongoose.model("RouteAssignment", routeAssignmentSchema);
