const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const staffController = require("../controllers/staffController");



router.get("/", staffController.getAllStaff);
router.post("/", upload.single("img"), staffController.createStaff);
router.get("/:id", staffController.getStaffById);
router.put("/:id", upload.single("img"), staffController.updateStaff);
router.delete("/:id", staffController.softDeleteStaff);
router.patch("/:id/status", staffController.changeStaffStatus);
router.patch("/:id/duty-status", staffController.changeDutyStatus);
router.post("/:staffId/document", upload.single("file"), staffController.uploadStaffDocument);

module.exports = router;
