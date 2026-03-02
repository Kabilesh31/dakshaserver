const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const productController = require("../controllers/productController");

router.post("/", upload.single("img"), productController.createProduct);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", upload.single("img"), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.post("/importProduct", upload.single("file"), productController.importProducts)
module.exports = router;


