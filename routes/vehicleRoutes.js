const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const vehicleController = require("../controllers/vehicleController");
const protectAuth = require("../middleware/auth")

router.post("/",protectAuth.protectAny, upload.single("img"), vehicleController.createVehicle);
router.get("/", protectAuth.protectAny, vehicleController.getVehicles);
router.get("/getAvailableVehicle",protectAuth.protectAny, vehicleController.getVehicleForAssign)
router.get("/:id",protectAuth.protectAny, vehicleController.getVehicleById);
router.put("/:id",protectAuth.protectAny, upload.single("img"), vehicleController.updateVehicle);
router.delete("/:id",protectAuth.protectAny, vehicleController.softDeleteVehicle);

module.exports = router;
