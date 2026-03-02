const express = require("express");
const router = express.Router();

const {
  staffLoginWithEmail,
  getMyProfile,
} = require("../controllers/staffAuthController");

const { isStaffAuthenticated } = require("../middleware/auth");

router.post("/staff/login", staffLoginWithEmail);
router.get("/staff/me", isStaffAuthenticated, getMyProfile);

module.exports = router;
