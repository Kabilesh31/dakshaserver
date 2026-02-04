const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const staffController = require("../controllers/staffController");

// ✅ NO auth middleware here
router.get("/", staffController.getAllStaff);

router.get("/:id", staffController.getStaffById);
router.post("/", upload.single("img"), staffController.createStaff);
router.put("/:id", upload.single("img"), staffController.updateStaff);
router.patch("/:id/status", staffController.changeStaffStatus);
router.patch("/:id/duty-status", staffController.changeDutyStatus);
router.delete("/:id", staffController.softDeleteStaff);
router.post("/:staffId/document", upload.single("file"), staffController.uploadStaffDocument);

module.exports = router;
