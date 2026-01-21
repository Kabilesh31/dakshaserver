const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const customerController = require("../controllers/customerController");

router.post("/", upload.single("img"), customerController.createCustomer);
router.get("/", customerController.getCustomers);
router.get("/:id", customerController.getCustomerById);
router.put("/:id", upload.single("img"), customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);
router.patch("/:id/status", customerController.changeCustomerStatus);

module.exports = router;