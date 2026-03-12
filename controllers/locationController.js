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
// GET latest location of a staff
exports.getLatestLocationByStaff = async (req, res) => {
  try {
    const { staffId } = req.params;

    const latestLocation = await Location.findOne({ staffId })
      .sort({ timeStamp: -1 }) // latest first
      .lean();

    if (!latestLocation) {
      return res.status(404).json({
        message: "No location found for this staff",
      });
    }

    res.status(200).json({
      staffId,
      lat: latestLocation.latitude,
      lng: latestLocation.longitude,
      batteryLevel: latestLocation.batteryLevel,
      gpsStatus: latestLocation.gpsStatus,
      networkStatus: latestLocation.networkStatus,
      updatedAt: latestLocation.timeStamp,
    });
  } catch (error) {
    console.error("Get location error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
exports.getLatestStaffLocation = async (req, res) => {
  try {
    const { staffId } = req.params;

    const location = await Location.findOne({ staffId })
      .sort({ updatedAt: -1 })
      .lean();

    if (!location) {
      return res.status(404).json({
        status: "error",
        message: "No live location found for this staff",
      });
    }

    return res.status(200).json({
      latitude: location.latitude,
      longitude: location.longitude,
      batteryLevel: location.batteryLevel,
      gpsStatus: location.gpsStatus,
      networkStatus: location.networkStatus,
      isOnline: location.isOnline,
      updatedAt: location.updatedAt,
    });
  } catch (error) {
    console.error("❌ LOCATION FETCH ERROR:", error);

    return res.status(500).json({
      status: "error",
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
exports.getLatestStaffLocation = async (req, res) => {
  try {
    const { staffId } = req.params;

    const location = await Location.findOne({ staffId })
      .sort({ updatedAt: -1 })
      .lean();

    if (!location) {
      return res.status(404).json({
        status: "error",
        message: "No live location found for this staff",
      });
    }

    return res.status(200).json({
      latitude: location.latitude,
      longitude: location.longitude,
      batteryLevel: location.batteryLevel,
      gpsStatus: location.gpsStatus,
      networkStatus: location.networkStatus,
      isOnline: location.isOnline,
      updatedAt: location.updatedAt,
    });
  } catch (error) {
    console.error("❌ LOCATION FETCH ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
