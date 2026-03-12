const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      index: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    batteryLevel: {
      type: Number, // 0–100
      min: 0,
      max: 100,
      default: null,
    },

    gpsStatus: {
      type: String,
      enum: ["on", "off"],
      default: "on",
    },

    networkStatus: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },

    isOnline: {
      type: Boolean,
      default: true,
    },

    timeStamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

/* Compound index for fast latest-location queries */
locationSchema.index({ staffId: 1, timeStamp: -1 });

module.exports = mongoose.model("location", locationSchema);
