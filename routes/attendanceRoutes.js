const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const protectAuth = require("../middleware/auth");
// check-in
router.post("/check-in", protectAuth.protectAny, attendanceController.checkIn);

// check-out
router.post(
  "/check-out",
  protectAuth.protectAny,
  attendanceController.checkOut,
);

// get all attendance
router.get("/", protectAuth.protectAny, attendanceController.getAllAttendance);

// get attendance by staff
router.get(
  "/staff/:staffId",
  protectAuth.protectAny,
  attendanceController.getAttendanceByStaff,
);

module.exports = router;
