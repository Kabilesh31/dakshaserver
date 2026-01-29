const Attendance = require("../model/attendanceModel");

// staff check-in
exports.checkIn = async (req, res) => {
  try {
    const { staffId, staffName, gpsStatus } = req.body;

    const today = new Date().toISOString().split("T")[0];

    // prevent multiple check-ins same day
    const existing = await Attendance.findOne({ staffId, date: today });

    if (existing) {
      return res.status(400).json({
        message: "Staff already checked in today",
      });
    }

    const attendance = await Attendance.create({
      staffId,
      staffName,
      date: today,
      startTime: new Date(),
      currentStatus: "checked-in",
      gpsStatus: gpsStatus || "unknown",
    });

    res.status(201).json({
      message: "Check-in successful",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// staff check-out
exports.checkOut = async (req, res) => {
  try {
    const { staffId } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({
      staffId,
      date: today,
      currentStatus: "checked-in",
    });

    if (!attendance) {
      return res.status(404).json({
        message: "No active check-in found",
      });
    }

    attendance.endTime = new Date();
    attendance.currentStatus = "checked-out";
    await attendance.save();

    res.status(200).json({
      message: "Check-out successful",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// get all attendance
exports.getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ createdAt: -1 });
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get attendance by staff
exports.getAttendanceByStaff = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      staffId: req.params.staffId,
    }).sort({ date: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
