const cron = require("node-cron");
const Staff = require("../model/staffModal");

cron.schedule(
  "59 23 * * *", // 11:59 PM
  async () => {
    try {
      console.log("🔄 Staff duty reset started");

      const result = await Staff.updateMany(
        {
          dutyStatus: "active",
          isDeleted: false
        },
        {
          $set: {
            dutyStatus: "inactive"
          }
        }
      );

      console.log(`✅ Staff duty reset completed. Modified: ${result.modifiedCount}`);

    } catch (error) {
      console.error("❌ Staff duty reset cron error:", error.message);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);
