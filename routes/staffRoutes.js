const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { isStaffAuthenticated } = require("../middleware/auth");
const staffController = require("../controllers/staffController");

// Get all staff
router.get("/", isStaffAuthenticated, staffController.getAllStaff);

// Create staff
router.post("/", upload.single("img"), staffController.createStaff);

// Get staff by id
router.get("/:id", isStaffAuthenticated, staffController.getStaffById);

// Update staff
router.put("/:id", upload.single("img"), staffController.updateStaff);

// Soft delete staff
router.delete("/:id", staffController.softDeleteStaff);

// Change staffStatus
router.patch("/:id/status", staffController.changeStaffStatus);

// **Change dutyStatus**
router.patch("/:id/duty-status", staffController.changeDutyStatus); 

// Upload staff document
router.post("/:staffId/document", upload.single("file"), staffController.uploadStaffDocument);

module.exports = router;
