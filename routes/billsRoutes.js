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

    // POST create new bill
    router.post("/", createBill);

    // GET all bills (optionally filtered by customerId)
    router.get("/", getBills);

    router.get("/:billId", getBillById);
    // PATCH change order status
    router.patch("/:billId/status", changeOrderStatus);
    router.put("/delivered/:id", markHasDelivered );

router.patch("/:id/payment", updatePaymentStatus);
router.get("/getBillsByStaff/:id", getBillsByStaff)
router.get("/getBillsByDeliveryStaff/:id", getBillsByDeliveryStaff)


    module.exports = router;
