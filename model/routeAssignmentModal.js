  const mongoose = require("mongoose");

  const routeAssignmentSchema = new mongoose.Schema({
    date: {
      type: String, // "2026-01-22"
      required: true
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Staff",
      required : true
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
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
    },
    vehicleNo : {
      type : String, 
      default : null
    }
  });

routeAssignmentSchema.index(
  { date: 1, routeId: 1 },
  { unique: true }
);

// ✅ Prevent same vehicle on same date
routeAssignmentSchema.index(
  { date: 1, vehicleNo: 1 },
  { unique: true, sparse: true }
);


  module.exports = mongoose.model("RouteAssignment", routeAssignmentSchema);
