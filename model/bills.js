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
    customerId: { type: String, required: true },
    orderedProducts: [orderedProductSchema],
    totalAmt: { type: Number, required: true }, // note: totalAmt, not totalAmount
    paidStatus: { type: Boolean, default: false },
    paymentMethod: { type: String, enum: ["cod", "online"], default: null, },
    orderStatus: {
      type: String,
      enum: ["pending", "approved", "out for delivery", "delivered"],
      default: "pending",
    },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// Use this to avoid overwriting cached model
module.exports = mongoose.models.Bill || mongoose.model("Bill", billSchema);
