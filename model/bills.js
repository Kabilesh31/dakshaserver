const mongoose = require("mongoose");

const orderedProductSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productId: { type: String, required: true },
  value: { type: Number, required: true },
  qty: { type: Number, required: true },
});

const billSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerId: { type: String, required: true }, // store ID only

    orderedProducts: {
      type: [orderedProductSchema],
      required: true,
    },

    totalAmt: { type: Number, required: true },

    paidStatus: {
      type: Boolean,
      default: false,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online", null],
      default: null,
    },

    orderStatus: {
      type: String,
      enum: ["pending", "approved", "out for delivery", "delivered"],
      default: "pending",
    },

    createdBy: { type: String, required: true }, // staffId
  },
  { timestamps: true }
);

module.exports = mongoose.models.Bill || mongoose.model("Bill", billSchema);
