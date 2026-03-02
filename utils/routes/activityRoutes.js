const express = require("express");
const router = express.Router()
const activityController  = require("../controllers/activityController")


router
    .route("/")
    .post(activityController.createActivityStatus)
    .get(activityController.getAllActivity)


module.exports = router;