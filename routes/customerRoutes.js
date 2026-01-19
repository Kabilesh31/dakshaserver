const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController")

router.put("/isDelete/:id", customerController.updateDelete)
router.put("/status/:id", customerController.updateStatus)
router.get('/transaction', customerController.getTransactions)
router
    .route("/") 
    .get(customerController.getAllDetails)
    .post(customerController.createCustomer)

router
    .route("/:id")
    .put(customerController.updateCustomer)

module.exports = router;