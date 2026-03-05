// routes/routeRoutes.js
const express = require("express")
const router = express.Router()
const protectController = require("../middleware/auth")
const {
  createRoute,
  getAllRoutes,
  getRouteById
} = require("../controllers/RouteController")

router.post("/", protectController.protectAny, createRoute)
router.get("/", protectController.protectAny, getAllRoutes)
router.get("/:id", protectController.protectAny, getRouteById)

module.exports = router