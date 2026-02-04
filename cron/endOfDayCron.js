const cron = require("node-cron");
const Staff = require("../model/staffModal");
const Attendance = require("../model/attendanceModel");

const getToday = () => new Date().toISOString().split("T")[0];

cron.schedule(
  "59 23 * * *",
  async () => {
    console.log("🌙 End-of-day attendance cron started");

    const today = getToday();

    try {
      const activeStaff = await Staff.find(
        { dutyStatus: "active" },
        { _id: 1 } // only get ID (important)
      );

      for (const staff of activeStaff) {
        // ✅ Auto checkout attendance
        await Attendance.updateOne(
          {
            staffId: staff._id,
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

        // ✅ Direct DB update (NO validation)
        await Staff.updateOne(
          { _id: staff._id },
          { $set: { dutyStatus: "inactive" } }
        );
      }

      console.log("✅ End-of-day auto checkout completed");
    } catch (error) {
      console.error("❌ End-of-day cron error:", error.message);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
