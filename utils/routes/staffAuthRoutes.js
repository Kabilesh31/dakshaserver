const express = require("express");
const router = express.Router();
const staffAuthController = require("../controllers/staffAuthController");
const { isStaffAuthenticated } = require("../middleware/auth");

// Login (mobile app)
router.post("/login", staffAuthController.staffLoginWithEmail);

// Get staff profile (mobile app) — requires token
router.get("/me", isStaffAuthenticated, staffAuthController.getMyProfile);

module.exports = router;
