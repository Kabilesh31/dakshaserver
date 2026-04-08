const Vehicle = require("../model/vehicleModal");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const RouteAssignment = require("../model/routeAssignmentModal");
const RouteSaleAssignment = require("../model/routeSaleAssignmentModal");
// create vehicle
exports.createVehicle = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadResult.secure_url;
    }

    const vehicle = await Vehicle.create({
      vehicleNumber: req.body.vehicleNumber,
      vehicleType: req.body.vehicleType,
      makeYear: req.body.makeYear,
      insuranceExpiry: req.body.insuranceExpiry,
      fcUpto: req.body.fcUpto,
      createdBy: req.body.createdBy,
      img: imageUrl,
    });

    res.status(201).json({
      message: "Vehicle created successfully",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get All vehicle - status true only
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: true }).sort({
      createdAt: -1,
    });

    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get single Vehicle

exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      status: true,
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      updateData.img = uploadResult.secure_url;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({
      message: "Vehicle updated successfully",
      data: vehicle,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// soft delete vehicle
exports.softDeleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status: false },
      { new: true },
    );

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVehicleForAssign = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
    // already assigned vehicles
    const routeAssigned = await RouteAssignment.find({ date }).select(
      "vehicleNo -_id",
    );

    const saleAssigned = await RouteSaleAssignment.find({ date }).select(
      "vehicleNo -_id",
    );

    const assignedVehicles = [
      ...routeAssigned.map((item) => item.vehicleNo),
      ...saleAssigned.map((item) => item.vehicleNo),
    ].filter((v) => v);

    const availableVehicles = await Vehicle.find({
      vehicleNumber: { $nin: assignedVehicles },
      status: true,
    });

    res.status(200).json({
      success: true,
      length: availableVehicles.length,
      data: availableVehicles,
    });
  } catch (error) {
    console.log(error);
  }
};
