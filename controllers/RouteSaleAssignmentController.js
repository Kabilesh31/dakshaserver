const RouteSaleAssignment = require("../model/routeSaleAssignmentModal")
const Customer = require("../model/customerModel")
const mongoose = require("mongoose");

exports.assignRoute = async (req, res) => {
  try {
    const { date, staffId, routeId, vehicleNo } = req.body;

    if (!date || !staffId || !routeId) {
      return res.status(400).json({
        message: "date, staffId and routeId are required"
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        message: "Invalid date format (YYYY-MM-DD required)"
      });
    }

    // 1️⃣ Route only once per date
    const existingRoute = await RouteSaleAssignment.findOne({ date, routeId });

    if (existingRoute) {
      return res.status(400).json({
        message: "Route already assigned for this date"
      });
    }

    // 2️⃣ Staff maximum 2 routes per day
    const staffRouteCount = await RouteSaleAssignment.countDocuments({
      date,
      staffId
    });

    if (staffRouteCount >= 2) {
      return res.status(400).json({
        message: "Staff can only have 2 routes per date"
      });
    }

    // 3️⃣ Vehicle only for one staff
    if (vehicleNo) {
      const vehicleUsedByOther = await RouteSaleAssignment.findOne({
        date,
        vehicleNo,
        staffId: { $ne: staffId }
      });

      if (vehicleUsedByOther) {
        return res.status(400).json({
          message: "Vehicle already assigned to another staff"
        });
      }
    }

    const assignment = await RouteSaleAssignment.create({
      date,
      staffId,
      routeId,
      vehicleNo
    });

    res.status(201).json({
      message: "Route assigned successfully",
      data: assignment
    });

  } catch (error) {
    console.error("Assign Route Error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
exports.getStaffRoutesByDate = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "date query parameter required"
      });
    }

    const routes = await RouteSaleAssignment.find({
      staffId,
      date
    }).populate("routeId", "routeName");

    res.json(routes);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// DELETE /api/routeassign/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await RouteSaleAssignment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Route assignment not found" });
    }

    res.json({ message: "Route unassigned successfully" });
  } catch (error) {
    console.error("Delete Assignment Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// GET ALL ASSIGNED ROUTES BY DATE (ADMIN)
exports.getAssignmentsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    const assignments = await RouteSaleAssignment.find({ date })
      .populate("routeId", "routeName description stops estimatedTime") // populate route details
      .populate("staffId", "name email") // populate staff name and email
      .sort({ createdAt: 1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET STAFF ROUTES FOR TODAY (STAFF APP)
exports.getStaffRoutesToday = async (req, res) => {
  try {
    const { staffId } = req.params
    const today = new Date().toISOString().slice(0, 10)

    const routes = await RouteSaleAssignment.find({
      staffId,
      date: today
    }).populate("routeId", "routeName")

    res.json(routes)
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

// MARK ROUTE COMPLETED
exports.completeRoute = async (req, res) => {
  try {
    const { id } = req.params

    await RouteSaleAssignment.findByIdAndUpdate(id, {
      status: "COMPLETED"
    })

    res.json({ message: "Route marked as completed" })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}


exports.getCustomerByAssignedStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { date } = req.query;

    if (!mongoose.Types.ObjectId.isValid(staffId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staffId"
      });
    }

    const staffObjectId = new mongoose.Types.ObjectId(staffId);


    const routeQuery = { staffId: staffObjectId };
    if (date) routeQuery.date = date;

    const assignments = await RouteSaleAssignment
      .find(routeQuery)
      .select("routeId");

    if (!assignments.length) {
      return res.status(200).json({
        success: false,
        message: date
          ? "No routes assigned for this day"
          : "No routes assigned till now",
        customers: []
      });
    }


    const routeIds = assignments.map(a => a.routeId);

   
    const customers = await Customer.find({
      routeId: { $in: routeIds },
      isDeleted: false,
      status: true
    })
      .populate("routeId", "routeName")
      .sort({ lineNo: 1 });

    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      totalCustomers: customers.length,
      customers
    });

  } catch (error) {
    console.error("Assigned Customers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


