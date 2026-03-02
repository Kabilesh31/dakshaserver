// routes/routeRoutes.js
const express = require("express")
const router = express.Router()

const {
  createRoute,
  getAllRoutes,
  getRouteById
} = require("../controllers/RouteController")

router.post("/", createRoute)
router.get("/", getAllRoutes)
router.get("/:id", getRouteById)

module.exports = router