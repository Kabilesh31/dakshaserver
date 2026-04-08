// routes/routeAssignmentRoutes.js
const express = require("express");
const router = express.Router();
const protectController = require("../middleware/auth");
const {
  assignRoute,
  getAssignmentsByDate,
  getStaffRoutesToday,
  completeRoute,
  deleteAssignment,
  getCustomerByAssignedStaff,
  getStaffRoutesByDate,
} = require("../controllers/RouteSaleAssignmentController");

// assign route to staff
router.post("/", protectController.protectAny, assignRoute);

// admin – get assigned routes by date
router.get("/", protectController.protectAny, getAssignmentsByDate);
router.delete("/:id", protectController.protectAny, deleteAssignment);
// staff – get today routes
router.get(
  "/staff/:staffId",
  protectController.protectAny,
  getStaffRoutesToday,
);
router.get(
  "/staff/:staffId",
  protectController.protectAny,
  getStaffRoutesByDate,
);

// mark route completed
router.put("/:id/complete", protectController.protectAny, completeRoute);
router.get(
  "/:staffId/assignedCustomer",
  protectController.protectAny,
  getCustomerByAssignedStaff,
);

module.exports = router;
