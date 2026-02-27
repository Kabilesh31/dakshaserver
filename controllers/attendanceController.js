const Attendance = require("../model/attendanceModel");
const Staff = require("../model/staffModal");

// staff check-in
exports.checkIn = async (req, res) => {
  try {
    const { staffId, staffName, gpsStatus } = req.body;

    const today = new Date().toISOString().split("T")[0];

    const existing = await Attendance.findOne({ staffId, date: today });

    // ✅ If already checked in, just return success
    if (existing) {
      return res.status(200).json({
        message: "Already checked in today",
        data: existing,
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

    await Staff.findByIdAndUpdate(staffId, {
      attendance: true,
    });

    scheduleAutoCheckout(attendance._id, staffId);

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

    // ✅ UPDATE STAFF ATTENDANCE STATUS
    await Staff.findByIdAndUpdate(staffId, {
      attendance: false,
    });

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
const scheduleAutoCheckout = async (attendanceId, staffId) => {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setHours(23, 59, 59, 999);

  const msUntilCheckout = tomorrow.getTime() - now.getTime();

  setTimeout(async () => {
    try {
      const attendance = await Attendance.findById(attendanceId);

      if (attendance && attendance.currentStatus === "checked-in") {
        attendance.endTime = new Date();
        attendance.currentStatus = "checked-out";
        await attendance.save();

        // ✅ Update staff attendance to false
        await Staff.findByIdAndUpdate(staffId, {
          attendance: false,
        });

        console.log(`Auto checkout done for attendance ${attendanceId}`);
      }
    } catch (err) {
      console.error("Auto checkout error:", err);
    }
  }, msUntilCheckout);
};
