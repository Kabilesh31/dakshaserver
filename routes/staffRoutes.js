const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const staffController = require("../controllers/staffController");
const protectController = require("../middleware/auth");
router.get("/", protectController.protectAny, staffController.getAllStaff);

router.get("/:id", protectController.protectAny, staffController.getStaffById);
router.post(
  "/",
  protectController.protectAny,
  upload.single("img"),
  staffController.createStaff,
);
router.put(
  "/:id",
  protectController.protectAny,
  upload.single("img"),
  staffController.updateStaff,
);
router.patch(
  "/:id/status",
  protectController.protectAny,
  staffController.changeStaffStatus,
);
router.patch(
  "/:id/duty-status",
  protectController.protectAny,
  staffController.changeDutyStatus,
);
router.delete(
  "/:id",
  protectController.protectAny,
  staffController.softDeleteStaff,
);
router.post(
  "/:staffId/document",
  protectController.protectAny,
  upload.single("file"),
  staffController.uploadStaffDocument,
);
router.put("/:id/assign-brands", staffController.assignBrands);
module.exports = router;
