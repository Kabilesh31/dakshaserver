const express = require("express");
const router = express.Router();

const {
  createBill,
  getBills,
  changeOrderStatus,
    getBillById,   
  updatePaymentStatus,
  markHasDelivered
} = require("../controllers/billsController");

// POST create new bill
router.post("/", createBill);

// GET all bills (optionally filtered by customerId)
router.get("/", getBills);

router.get("/:billId", getBillById);
// PATCH change order status
router.patch("/:billId/status", changeOrderStatus);
router.put("/delivered/:id", markHasDelivered );

router.patch("/:id/payment", updatePaymentStatus);

module.exports = router;
