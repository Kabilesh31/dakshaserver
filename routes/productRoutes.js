const express = require("express");
const router = express.Router()
const productController = require("../controllers/productController")
const multer = require("multer")

const storage = multer.memoryStorage()
const upload = multer({ storage : storage })

router.post("/importProducts", productController.importProducts)
router.put("/updateStocks/:id", productController.reduceStocks )

router
    .route("/")
    .get(productController.getAllDetails)
    .post(upload.single('file'), productController.createProduct)

router
    .route("/:id")
    .put(upload.single('file'),productController.updateProductData)
    .delete(productController.DeleteProductData)


module.exports = router
