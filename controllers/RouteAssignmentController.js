// controllers/routeAssignmentController.js
const RouteAssignment = require("../model/routeAssignmentModal")
const Customer = require("../model/customerModel")
const mongoose = require("mongoose");
// Assign Route to Staff
exports.assignRoute = async (req, res) => {
  try {
    const { date, staffId, routeId } = req.body

    if (!date || !staffId || !routeId) {
      return res.status(400).json({
        message: "date, staffId and routeId are required"
      })
    }

    // check route already assigned today
    const routeAssigned = await RouteAssignment.findOne({ date, routeId })
    if (routeAssigned) {
      return res.status(400).json({
        message: "Route already assigned for this date"
      })
    }

    // check staff route count (max 2)
    const staffCount = await RouteAssignment.countDocuments({
      date,
      staffId
    })

    if (staffCount >= 2) {
      return res.status(400).json({
        message: "Staff already has 2 routes today"
      })
    }

    // assign route
    const assignment = await RouteAssignment.create({
      date,
      staffId,
      routeId
    })

    res.status(201).json({
      message: "Route assigned successfully",
      data: assignment
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}

// DELETE /api/routeassign/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await RouteAssignment.findByIdAndDelete(id);

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

    const assignments = await RouteAssignment.find({ date })
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

    const routes = await RouteAssignment.find({
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

    await RouteAssignment.findByIdAndUpdate(id, {
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

    const assignments = await RouteAssignment
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


exports.assignRoute2 = async (req, res) => {
  try {
    const { date, staffId, salesStaffId, routeId } = req.body;

    // ---------------- VALIDATION ----------------
    if (!date || !routeId) {
      return res.status(400).json({
        message: "date and routeId are required",
      });
    }

    if (!staffId && !salesStaffId) {
      return res.status(400).json({
        message: "At least one staff (delivery or sales) must be assigned",
      });
    }

    // Find existing assignment for same date + route
    let assignment = await RouteAssignment.findOne({ date, routeId });

    let isUpdate = false;

    // =====================================================
    // 🔹 UPDATE EXISTING ASSIGNMENT
    // =====================================================
    if (assignment) {
      isUpdate = true;

      // -------- DELIVERY STAFF VALIDATION --------
      if (staffId !== undefined) {
        const deliveryStaffCount = await RouteAssignment.countDocuments({
          date,
          staffId,
          _id: { $ne: assignment._id }, // exclude current
        });

        if (staffId && deliveryStaffCount >= 2) {
          return res.status(400).json({
            message: "Delivery staff already has 2 routes today",
          });
        }

        assignment.staffId = staffId || null;
      }

      // -------- SALES STAFF VALIDATION --------
      if (salesStaffId !== undefined) {
        const salesStaffCount = await RouteAssignment.countDocuments({
          date,
          salesStaffId,
          _id: { $ne: assignment._id }, // exclude current
        });

        if (salesStaffId && salesStaffCount >= 2) {
          return res.status(400).json({
            message: "Sales staff already has 2 routes today",
          });
        }

        assignment.salesStaffId = salesStaffId || null;
      }

      await assignment.save();
    }

    // =====================================================
    // 🔹 CREATE NEW ASSIGNMENT
    // =====================================================
    else {

      // -------- DELIVERY STAFF VALIDATION --------
      if (staffId) {
        const deliveryStaffCount = await RouteAssignment.countDocuments({
          date,
          staffId,
        });

        if (deliveryStaffCount >= 2) {
          return res.status(400).json({
            message: "Delivery staff already has 2 routes today",
          });
        }
      }

      // -------- SALES STAFF VALIDATION --------
      if (salesStaffId) {
        const salesStaffCount = await RouteAssignment.countDocuments({
          date,
          salesStaffId,
        });

        if (salesStaffCount >= 2) {
          return res.status(400).json({
            message: "Sales staff already has 2 routes today",
          });
        }
      }

      assignment = await RouteAssignment.create({
        date,
        routeId,
        staffId: staffId || null,
        salesStaffId: salesStaffId || null,
      });
    }

    // Populate response
    const populatedAssignment = await RouteAssignment.findById(
      assignment._id
    )
      .populate("staffId", "name email phone")
      .populate("salesStaffId", "name email phone")
      .populate("routeId", "routeName areas");

    return res.status(isUpdate ? 200 : 201).json({
      message: isUpdate
        ? "Route assignment updated successfully"
        : "Route assigned successfully",
      data: populatedAssignment,
    });

  } catch (error) {
    console.error("Error in assignRoute:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};
