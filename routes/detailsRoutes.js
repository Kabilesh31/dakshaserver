const express = require("express");
const router = express.Router();
const detailsController = require("../controllers/detailsController")
const multer = require("multer")


const storage = multer.memoryStorage()
const upload = multer({ storage : storage })

router.post("/", upload.single("file"),detailsController.createDetails)
router.get('/', detailsController.getAllDetails)


router
    .route("/:id")
    .put(upload.single('file'),detailsController.updateProductData)

module.exports = router;