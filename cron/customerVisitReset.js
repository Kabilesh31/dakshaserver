const cron = require("node-cron");
const Customer = require("../model/customerModel");

cron.schedule(
  "59 23 * * *", // 11:59 PM
  async () => {
    try {
      console.log("🔄 Customer visit reset started");

      await Customer.updateMany(
        {}, //  Reset ALL customers
        {
          $set: {
            isVisited: false,
            visitedBy: null,
            visitedAt: null,
          },
        },
      );

      console.log("✅ Customer visit reset completed");
    } catch (error) {
      console.error("❌ Visit reset cron error:", error.message);
    }
  },
  {
    timezone: "Asia/Kolkata",
  },
);
