const Attendance = require("../model/attendanceModel");

const getToday = () => new Date().toISOString().split("T")[0];

// AUTO CHECK-IN
exports.autoCheckIn = async (staffId, staffName) => {
  const today = getToday();

  const alreadyCheckedIn = await Attendance.findOne({
    staffId,
    date: today,
  });

  if (alreadyCheckedIn) return alreadyCheckedIn;

  return await Attendance.create({
    staffId,
    staffName,
    date: today,
    startTime: new Date(),
    currentStatus: "checked-in",
    gpsStatus: "unknown",
  });
};

// AUTO CHECK-OUT
exports.autoCheckOut = async (staffId) => {
  const today = getToday();

  const attendance = await Attendance.findOne({
    staffId,
    date: today,
    currentStatus: "checked-in",
  });

  if (!attendance) return null;

  attendance.endTime = new Date();
  attendance.currentStatus = "checked-out";
  await attendance.save();

  return attendance;
};
