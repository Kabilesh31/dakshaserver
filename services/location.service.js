const Location = require("../model/location");

exports.saveLocation = async (payload) => {
  const {
    staffId,
    latitude,
    longitude,
    batteryLevel = null,
    gpsStatus = "on",
    networkStatus = "online",
    isOnline = true,
    timeStamp = Date.now(),
  } = payload;

  if (!staffId || latitude == null || longitude == null) {
    throw new Error("staffId, latitude and longitude are required");
  }

  return await Location.create({
    staffId,
    latitude,
    longitude,
    batteryLevel,
    gpsStatus,
    networkStatus,
    isOnline,
    timeStamp,
  });
};
