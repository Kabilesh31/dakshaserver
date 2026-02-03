const Location = require("../model/location");
const { saveLocation } = require("../services/location.service");

exports.createLocation2 = async (req, res) => {
  try {
    const {
      staffId,
      latitude,
      longitude,
      batteryLevel,
      gpsStatus,
      networkStatus,
      isOnline,
      timeStamp,
    } = req.body;

    // Validation
    if (!staffId || latitude == null || longitude == null) {
      return res.status(400).json({
        message: "staffId, latitude and longitude are required",
      });
    }

    const newLocation = await Location.create({
      staffId,
      latitude,
      longitude,
      batteryLevel,
      gpsStatus,
      networkStatus,
      isOnline,
      timeStamp: timeStamp || Date.now(),
    });

    res.status(201).json({
      message: "Location saved successfully",
      location: newLocation,
    });
  } catch (error) {
    console.error("Location POST error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const location = await saveLocation(req.body);

    res.status(201).json({
      message: "Location saved successfully",
      location,
    });
  } catch (error) {
    console.error("Location POST error:", error.message);

    res.status(400).json({
      message: error.message || "Internal server error",
    });
  }
};