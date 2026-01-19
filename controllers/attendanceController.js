const Attendance = require("../model/attendanceModal");
const moment = require("moment");

exports.createAttendance = async (req, res) => {
    try {
        const { employeeId, date, status, hours } = req.body;
    
        // Check if attendance already exists for this employee on the given date
        let existingRecord = await Attendance.findOne({ employeeId, date });
    
        if (existingRecord) {
          // Update existing attendance
          existingRecord.status = status;
          existingRecord.hours = status === "permission" ? hours : null;
          await existingRecord.save();
          return res.json({ message: "Attendance updated successfully", attendance: existingRecord });
        }
    
        // Create new attendance record
        const newAttendance = new Attendance({
          employeeId,
          date,
          status,
          hours: status === "permission" ? hours : null,
        });
    
        await newAttendance.save();
        res.status(201).json({ message: "Attendance recorded successfully", attendance: newAttendance });
    
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}




exports.getAttendance = async (req, res) => {
    try {
        const data = await Attendance.find();
        res.json(data).status(200);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};
