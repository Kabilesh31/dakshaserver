const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    staffName: {
      type: String,
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD (easy for daily attendance)
      required: true,
    },

    startTime: {
      type: Date,
    },

    endTime: {
      type: Date,
    },

    currentStatus: {
      type: String,
      enum: ["checked-in", "checked-out"],
      default: "checked-in",
    },

    gpsStatus: {
      type: String,
      enum: ["inside", "outside", "unknown"],
      default: "unknown",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  },
);

module.exports = mongoose.model("Attendance", attendanceSchema);
