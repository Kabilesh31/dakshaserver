const cron = require("node-cron");
const Staff = require("../model/staffModal");

cron.schedule(
  "* * * * *", // 11:59 PM
  async () => {
    try {
      console.log("🔄 Staff duty reset started");

      const activeStaff = await Staff.find({
        dutyStatus: "active",
        isDeleted: false,
        startedAt: { $ne: null },
      });

      let updatedCount = 0;

      for (const staff of activeStaff) {
        const now = new Date();

        // Optional: Calculate worked duration
        const workedMilliseconds = now - staff.startedAt;
        const workedHours = (workedMilliseconds / (1000 * 60 * 60)).toFixed(2);

        await Staff.findByIdAndUpdate(staff._id, {
          $set: {
            dutyStatus: "inactive",
            endedAt: now,
          },
        });

        console.log(
          `✅ ${staff.name} auto-closed. Worked: ${workedHours} hours`
        );

        updatedCount++;
      }

      console.log(`🎯 Staff duty reset completed. Modified: ${updatedCount}`);
    } catch (error) {
      console.error("❌ Staff duty reset cron error:", error.message);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);