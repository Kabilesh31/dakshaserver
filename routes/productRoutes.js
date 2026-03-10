const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const productController = require("../controllers/productController");
const protectController = require("../middleware/auth")

router.post("/", upload.single("img"), productController.createProduct);
router.get("/", protectController.protectAny, productController.getProducts);
router.get("/brands", productController.getProductBrands)
router.get("/:id", protectController.protectAny, productController.getProductById);
router.put("/:id", upload.single("img"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.post("/importProduct", upload.single("file"), productController.importProducts)
module.exports = router;


