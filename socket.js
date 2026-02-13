const { saveLocation } = require("./services/location.service");

let ioInstance; // 🔥 store io globally

module.exports = (io) => {
  ioInstance = io; // save instance

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ======================
    // Staff location updates
    // ======================
    socket.on("staffLocationUpdate", async (data) => {
      try {
        const location = await saveLocation(data);

        io.emit("liveLocationUpdate", {
          staffId: location.staffId,
          latitude: location.latitude,
          longitude: location.longitude,
          timeStamp: location.timeStamp,
        });
      } catch (err) {
        console.error("Socket location error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

// 🔥 NEW FUNCTION FOR NOTIFICATIONS
module.exports.sendNotification = (notification) => {
  if (!ioInstance) {
    console.log("❌ Socket not initialized");
    return;
  }

  console.log("🔥 Emitting notification:", notification._id);

  ioInstance.emit("newNotification", notification);
};

