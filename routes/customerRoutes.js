const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const customerController = require("../controllers/customerController");
const protectAuth = require("../middleware/auth")

router.get("/route/:routeId", protectAuth.protectAny, customerController.getCustomersByRoute);

router.put("/:id", protectAuth.protectAny, upload.single("img"), customerController.updateCustomer);
router.delete("/:id", protectAuth.protectAny, customerController.deleteCustomer);
router.patch("/:id/status",protectAuth.protectAny, customerController.changeCustomerStatus);
router.get("/:id",protectAuth.protectAny, customerController.getCustomerById);
router.patch("/visit/:customerId",protectAuth.protectAny, customerController.toggleVisitStatus);

// Other routes
router.post("/",protectAuth.protectAny, upload.single("img"), customerController.createCustomer);
router.get("/",protectAuth.protectAny, customerController.getCustomers);
router.get("/getCustomerbyStaff/:id",protectAuth.protectAny, customerController.getCustomerByStaffId)

module.exports = router;
