const express = require("express");
const router = express.Router();
const protectController = require("../middleware/auth");
const {
  createLocation,
  getLatestStaffLocation,
} = require("../controllers/locationController");

router.post("/", protectController.protectAny, createLocation);
router.get(
  "/latest/:staffId",
  protectController.protectAny,
  getLatestStaffLocation,
);
module.exports = router;
