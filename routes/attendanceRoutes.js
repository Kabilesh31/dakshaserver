const attendanceController = require('../controllers/attendanceController');
const express = require('express');
const router = express.Router();


router.post('/', attendanceController.createAttendance);
router.get('/', attendanceController.getAttendance);



module.exports = router;