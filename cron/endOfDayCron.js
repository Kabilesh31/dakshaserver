const cron = require("node-cron");
const Staff = require("../model/staffModal");
const Attendance = require("../model/attendanceModel");

const getToday = () => new Date().toISOString().split("T")[0];

cron.schedule(
  "59 23 * * *", // Run at 11:59 PM
  async () => {
    console.log("🌙 End-of-day attendance cron started");

    const today = getToday();

    try {
      // 1️⃣ Auto checkout all still checked-in
      await Attendance.updateMany(
        {
          date: today,
          currentStatus: "checked-in",
        },
        {
          $set: {
            endTime: new Date(),
            currentStatus: "checked-out",
          },
        }
      );

      console.log("✅ Auto checkout completed");

      // 2️⃣ Reset attendance for ALL staff (no dutyStatus condition)
      await Staff.updateMany(
        {},
        { $set: { attendance: false } }
      );

      console.log("🔄 All staff attendance reset to false");

      console.log("✅ End-of-day process completed");
    } catch (error) {
      console.error("❌ End-of-day cron error:", error.message);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
