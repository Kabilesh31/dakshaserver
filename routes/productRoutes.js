const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const productController = require("../controllers/productController");
const protectController = require("../middleware/auth")

router.post("/", protectController.protectAny, upload.single("img"), productController.createProduct);
router.get("/", protectController.protectAny, productController.getProducts);
router.get("/:id", protectController.protectAny, productController.getProductById);
router.put("/:id", protectController.protectAny, upload.single("img"), productController.updateProduct);
router.delete("/:id", protectController.protectAny, productController.deleteProduct);
router.post("/importProduct", protectController.protectAny, upload.single("file"), productController.importProducts)
module.exports = router;


