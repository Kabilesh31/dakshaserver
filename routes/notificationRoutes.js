const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const protectController = require("../middleware/auth");

router.get(
  "/",
  protectController.protectAny,
  notificationController.getNotifications,
);
router.patch(
  "/:id/read",
  protectController.protectAny,
  notificationController.markAsRead,
);
router.patch(
  "/read-all",
  protectController.protectAny,
  notificationController.markAllAsRead,
);

module.exports = router;
