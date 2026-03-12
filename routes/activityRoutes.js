const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const protectController = require("../middleware/auth");

router
  .route("/")
  .post(protectController.protectAny, activityController.createActivityStatus)
  .get(protectController.protectAny, activityController.getAllActivity);

module.exports = router;
