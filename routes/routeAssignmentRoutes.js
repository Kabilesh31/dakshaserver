// routes/routeAssignmentRoutes.js
const express = require("express")
const router = express.Router()

const {
  assignRoute,
  getAssignmentsByDate,
  getStaffRoutesToday,
  completeRoute,  
  deleteAssignment,
  getCustomerByAssignedStaff, 
  assignRoute2
} = require("../controllers/RouteAssignmentController")

// assign route to staff
router.post("/", assignRoute)
router.post("/assignRoute", assignRoute2)

// admin – get assigned routes by date
router.get("/", getAssignmentsByDate)
router.delete("/:id", deleteAssignment);
// staff – get today routes
router.get("/staff/:staffId", getStaffRoutesToday)

// mark route completed
router.put("/:id/complete", completeRoute)
router.get("/:staffId/assignedCustomer", getCustomerByAssignedStaff)
module.exports = router
