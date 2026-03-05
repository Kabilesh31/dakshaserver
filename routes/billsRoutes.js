const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const {
  createBill,
  getBills,
  changeOrderStatus,
  getBillById,   
  updatePaymentStatus,
  markHasDelivered,
  getBillsByStaff,
  getBillsByDeliveryStaff,
} = require("../controllers/billsController");
const protectAuth = require("../middleware/auth")
    // POST create new bill
    router.post("/",protectAuth.protectAny, createBill);

    // GET all bills (optionally filtered by customerId)
    router.get("/", protectAuth.protectAny, getBills);

    router.get("/:billId",protectAuth.protectAny, getBillById);
    // PATCH change order status
    router.patch("/:billId/status",protectAuth.protectAny, changeOrderStatus);
    router.put("/delivered/:id", protectAuth.protectAny, markHasDelivered );

router.patch("/:id/payment",protectAuth.protectAny, updatePaymentStatus);
router.get("/getBillsByStaff/:id",protectAuth.protectAny, getBillsByStaff)
router.get("/getBillsByDeliveryStaff/:id",protectAuth.protectAny, getBillsByDeliveryStaff)


    module.exports = router;
