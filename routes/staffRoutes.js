const express = require("express")
const router = express.Router()
const multer = require("multer")
const staffController = require('../controllers/staffController')

const storage = multer.memoryStorage();
const upload  = multer({storage : storage})

router.put("/isDelete/:id", staffController.updateIsDeleted)
router.post("/importLeads", staffController.importStaff)
router.get('/exportStaffData', staffController.exportStaff)

router
    .route("/")
    .get(staffController.getAllDetails)
    .post(upload.single('file'), staffController.createStaff)

router
    .route("/:id")
    .put(upload.single('file'),staffController.updateStaffData)




module.exports = router;