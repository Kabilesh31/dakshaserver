const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const vehicleController = require("../controllers/vehicleController");

router.post("/", upload.single("img"), vehicleController.createVehicle);
router.get("/", vehicleController.getVehicles);
router.get("/getAvailableVehicle", vehicleController.getVehicleForAssign)
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id", upload.single("img"), vehicleController.updateVehicle);
router.delete("/:id", vehicleController.softDeleteVehicle);

module.exports = router;
