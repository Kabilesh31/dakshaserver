const Staff = require("../model/staffModal");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { autoCheckIn, autoCheckOut } = require("../services/attendanceService");


// create employee
exports.createStaff = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "staff");
      imageUrl = result.secure_url;
    }

    const staff = await Staff.create({
      name: req.body.name,
      type: req.body.type,
      email: req.body.email,
      mobile: req.body.mobile,          
      password: req.body.mobile,        
      staffCode: req.body.staffCode,
      bloodGroup: req.body.bloodGroup,
      createdBy: req.body.createdBy,
      img: imageUrl,
      dutyStatus: req.body.dutyStatus || "active",
      documents: [],
    });

    res.status(201).json({
      message: "Staff created successfully",
      data: staff,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    const staff = await Staff.findById(req.params.id).select("+password");

    staff.password = newPassword; 
    await staff.save();           

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// get all wemployee
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// get employeeby id 
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// update employee

exports.updateStaff = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // ✅ Allow only valid dutyStatus values
    if (updateData.dutyStatus && !["active", "inactive"].includes(updateData.dutyStatus)) {
      return res.status(400).json({
        message: "Invalid dutyStatus. Allowed values: active, inactive",
      });
    }

    // Upload image if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "staff");
      updateData.img = result.secure_url;
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true, // ✅ important
      }
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({
      message: "Staff updated successfully",
      data: staff,
    });

  } catch (error) {
    console.error("Update Staff Error:", error);
    res.status(500).json({ error: error.message });
  }
};


// soft delete - isDeleted status will change
exports.softDeleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({
      message: "Staff deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// staffStatus change - not booloean
exports.changeStaffStatus = async (req, res) => {
  try {
    const { staffStatus } = req.body;

    if (!["active", "inactive"].includes(staffStatus)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { staffStatus },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({
      message: "Status updated successfully",
      data: staff,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// upload pdf files
exports.uploadStaffDocument = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { filename } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      `staff/${staffId}/documents`,
      "raw"
    );

    const staff = await Staff.findByIdAndUpdate(
      staffId,
      {
        $push: {
          documents: {
            filename,
            url: result.secure_url,
            public_id: result.public_id,
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: "Document uploaded successfully",
      document: {
        filename,
        url: result.secure_url,
      },
      staff,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changeDutyStatus = async (req, res) => {
  try {
    const { dutyStatus } = req.body;

    if (!["active", "inactive"].includes(dutyStatus)) {
      return res.status(400).json({ message: "Invalid duty status" });
    }

    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (staff.dutyStatus === dutyStatus) {
      return res.json({
        message: "Duty status already updated",
        data: staff,
      });
    }

    // 🛡️ FIX INVALID documents FIELD
    if (!Array.isArray(staff.documents)) {
      staff.documents = [];
    }

    if (dutyStatus === "active") {
      await autoCheckIn(staff._id, staff.name);
    }

    if (dutyStatus === "inactive") {
      await autoCheckOut(staff._id);
    }

    staff.dutyStatus = dutyStatus;
    await staff.save();

    res.json({
      message: "Duty status updated successfully",
      data: staff,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

