// routes/routeAssignmentRoutes.js
const express = require("express")
const router = express.Router()

const {
  assignRoute,
  getAssignmentsByDate,
  getStaffRoutesToday,
  completeRoute
} = require("../controllers/RouteAssignmentController")

// assign route to staff
router.post("/route-assign", assignRoute)

// admin – get assigned routes by date
router.get("/route-assign", getAssignmentsByDate)

// staff – get today routes
router.get("/route-assign/staff/:staffId", getStaffRoutesToday)

// mark route completed
router.put("/route-assign/:id/complete", completeRoute)

module.exports = router
