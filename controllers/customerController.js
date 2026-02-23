const Customer = require("../model/customerModel");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const Staff = require("../model/staffModal");
const mongoose = require("mongoose");

// create Customer
exports.createCustomer = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "customers");
      imageUrl = result.secure_url;
    }

    const lastCustomer = await Customer.findOne({
      routeId: req.body.routeId,
      isDeleted: false
    })
      .sort({ lineNo: -1 })  
      .select("lineNo");

    const newLineNo = lastCustomer ? lastCustomer.lineNo + 1 : 1;

    const customer = await Customer.create({
      ...req.body,
      lineNo: newLineNo,
      geoLocation: {
        lat: req.body.lat,
        long: req.body.long,
      },
      img: imageUrl,
    });

    res.status(201).json({
      message: "Customer created successfully",
      data: customer,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ isDeleted: false })
      .sort({
        routeId: 1,  
        lineNo: 1    
      });

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateCustomer = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "customers"
      );
      updateData.img = result.secure_url;
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete Customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer deleted successfully (soft delete)",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// customer Status Change
exports.changeCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer status updated",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getCustomers = async (req, res) => {
  const customers = await Customer.find({ isDeleted: false })
    .sort({ routeId: 1, lineNo: 1 });

  res.json(customers);
};
exports.getCustomersByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    let customers = await Customer.find({
      routeId,
      isDeleted: false,
    }).sort({ lineNo: 1 });

    // Filter invalid coordinates
    customers = customers.filter(c => {
      const lat = Number(c.geoLocation?.lat);
      const lng = Number(c.geoLocation?.long);
      return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    });

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCustomerByStaffId = async (req, res) => {
  try {
    const customer = await Customer.find({
      createdBy: req.params.id,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.toggleVisitStatus = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { staffId, action, nextVisitDate, notes, currentVisitLocation } = req.body;

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: "Invalid staffId" });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    if (!staffId || !action) {
      return res.status(400).json({
        message: "staffId and action are required",
      });
    }

    const staff = await Staff.findById(staffId).lean();

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found",
      });
    }

    const staffType = String(staff.type || "").trim().toLowerCase();

    if (staffType !== "sales") {
      return res.status(403).json({
        message: "Only sales staff can mark visit",
      });
    }

    let updateData = {};

    if (action === "in") {
      updateData = {
        isVisited: true,
        visitedBy: staff._id,
        visitedAt: new Date(),
      };
    } 
    else if (action === "out") {
      // Validate location if provided (optional now)
      if (currentVisitLocation) {
        if (!currentVisitLocation.lat || !currentVisitLocation.long) {
          return res.status(400).json({
            message: "Both latitude and longitude are required when location is provided",
          });
        }
        
        // Validate that lat/long are valid numbers
        const lat = parseFloat(currentVisitLocation.lat);
        const long = parseFloat(currentVisitLocation.long);
        
        if (isNaN(lat) || isNaN(long)) {
          return res.status(400).json({
            message: "Invalid latitude or longitude values",
          });
        }
      }

      // Base update data
      updateData = {
        isVisited: true,
        visitedBy: staff._id,
        visitedAt: new Date(),
      };

      // Create nextVisit object with all available data
      const nextVisitObj = {};

      // Add next visit date if provided
      if (nextVisitDate) {
        nextVisitObj.nextVisitDate = new Date(nextVisitDate);
      }

      // Add notes if provided
      if (notes) {
        nextVisitObj.notes = notes;
      }

      // Add current visit location if provided
      if (currentVisitLocation && currentVisitLocation.lat && currentVisitLocation.long) {
        nextVisitObj.currentVisitLocation = {
          lat: currentVisitLocation.lat,
          long: currentVisitLocation.long
        };
      }

      // Only set nextVisit if there's data to store
      if (Object.keys(nextVisitObj).length > 0) {
        updateData.nextVisit = nextVisitObj;
      }
    } 
    else {
      return res.status(400).json({
        message: "Action must be 'in' or 'out'",
      });
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: customerId, isDeleted: false },
      { $set: updateData },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      message: `Customer visit marked ${action}`,
      data: customer,
    });

  } catch (error) {
    console.error("Visit API Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};