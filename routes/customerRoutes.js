const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const customerController = require("../controllers/customerController");


router.get("/route/:routeId", customerController.getCustomersByRoute);
// ✅ Then the generic :id routes
router.put("/:id", upload.single("img"), customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);
router.patch("/:id/status", customerController.changeCustomerStatus);
router.get("/:id", customerController.getCustomerById);
router.patch("/visit/:customerId", customerController.toggleVisitStatus);

// Other routes
router.post("/", upload.single("img"), customerController.createCustomer);
router.get("/", customerController.getCustomers);
router.get("/getCustomerbyStaff/:id", customerController.getCustomerByStaffId)

module.exports = router;
