const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee", // Reference to Employee model
      required: true,
    },
    date: {
      type: Date, // Store as Date instead of String
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "half", "permission"],
      required: true,
    },
    hours: {
      type: Number,
      default: null,
      required: function () {
        return this.status === "permission";
      },
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance;
