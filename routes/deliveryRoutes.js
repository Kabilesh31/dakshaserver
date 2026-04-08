const express = require("express");
const router = express.Router();
const { updateLineOrder } = require("../controllers/deliveryController");
const protectController = require("../middleware/auth");
router.put("/update-line-order", protectController.protectAny, updateLineOrder);

module.exports = router;
