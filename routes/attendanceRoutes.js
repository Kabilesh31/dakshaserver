const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// check-in
router.post("/check-in", attendanceController.checkIn);

// check-out
router.post("/check-out", attendanceController.checkOut);

// get all attendance
router.get("/", attendanceController.getAllAttendance);

// get attendance by staff
router.get("/staff/:staffId", attendanceController.getAttendanceByStaff);

module.exports = router;
