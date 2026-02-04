const { saveLocation } = require("./services/location.service");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

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
