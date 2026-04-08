const express = require("express");
const router = express.Router();
const detailsController = require("../controllers/detailsController");
const multer = require("multer");
const protectController = require("../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
  "/",
  protectController.protectAny,
  upload.single("file"),
  detailsController.createDetails,
);
router.get("/", protectController.protectAny, detailsController.getAllDetails);

router
  .route("/:id")
  .put(
    protectController.protectAny,
    upload.single("file"),
    detailsController.updateProductData,
  );

module.exports = router;
