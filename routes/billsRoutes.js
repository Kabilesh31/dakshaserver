    const express = require("express");
    const router = express.Router();
    const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  createBill,
  getBills,
  changeOrderStatus,
  getBillById,   
  updatePaymentStatus,
  markHasDelivered,
  getBillsByStaff,
  getBillsByDeliveryStaff,
  updateOrderWithUpload
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
router.patch("/:id/upload", upload.single("pdf"), updateOrderWithUpload)

    module.exports = router;
