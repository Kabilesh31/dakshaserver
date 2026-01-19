const express = require("express")
const router = express.Router()
const billingController = require("../controllers/billingController")



router.post("/",billingController.generateBill)
router.get("/:id", billingController.getBillByPhone)
router.put("/invoiceUpdate/:id", billingController.updateInvoice)
router.put("/invoiceGenerate/:id", billingController.updateGenerated )
router.get("/getAllBillByPhone/:id", billingController.getAllBillByPhone)
router.put("/updateisPaid/:id", billingController.updateHasPaid)
router.put("/updateQuantity/:id", billingController.updateQuantity)
router.delete("/deleteBill/:id", billingController.deleteBill)
router.get("/", billingController.getAllBill)
router.get('/unpaidbills/:id', billingController.getUnpaidBills)
router.get("/totalAmounts/all", billingController.getTotalAmount);

module.exports = router;