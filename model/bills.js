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
     customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

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
      enum: ["Cash", "UPI", "CARD", null],
      default: null,
    },
    paymentCollectedBy : {
      type : String,
      default : null
    },
    deliveredBy : {
      type : String,
      default : null
    },
    paymentCollectedAt : {
      type : Date,
      default : null
    },
      deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // change if needed
      default: null,
    },

    deliveryLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },

    deliveryImage: {
      type: String,
      default: null,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",          
        "out for delivery",  
        "delivered",
      ],
      default: "pending",
    },


    createdBy: { type: String, required: true }, // staffId
  },
  { timestamps: true }
);

module.exports = mongoose.models.Bill || mongoose.model("Bill", billSchema);
