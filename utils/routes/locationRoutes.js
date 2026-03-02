const express = require("express");
const router = express.Router();

const {
  createLocation,
  getLatestStaffLocation,
} = require("../controllers/locationController");

router.post("/", createLocation);
router.get("/latest/:staffId", getLatestStaffLocation);
module.exports = router;
