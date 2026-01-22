// controllers/routeAssignmentController.js
const RouteAssignment = require("../model/routeAssignmentModal")

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
