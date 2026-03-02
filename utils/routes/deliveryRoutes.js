const express = require("express");
const router = express.Router();
const { updateLineOrder } = require("../controllers/deliveryController");

router.put("/update-line-order", updateLineOrder);

module.exports = router;
