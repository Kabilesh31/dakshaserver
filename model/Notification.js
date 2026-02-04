const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // or User (based on your app)
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["bill", "order", "payment", "system"],
      default: "bill",
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
    },

    seen: {
      type: Boolean,
      default: false, // 👈 unread by default
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
