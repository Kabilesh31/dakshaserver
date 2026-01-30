const express = require("express");
const router = express.Router();
const { createLocation } = require("../controllers/locationController");

// No auth middleware needed
router.post("/", createLocation);

module.exports = router;
