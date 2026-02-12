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
      // Only check active staff
      const activeStaff = await Staff.find(
        { dutyStatus: "active" },
        { _id: 1 }
      );

      for (const staff of activeStaff) {
        const result = await Attendance.updateOne(
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

        if (result.matchedCount > 0) {
          console.log(`✅ Auto checkout done for staffId: ${staff._id}`);
        }
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
