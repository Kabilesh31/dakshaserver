const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword,
);

router
  .route("/")
  .get(authController.protect, userController.getAllUser)
  .post(authController.protect, userController.createUser);

router
  .route("/:id")
  .get(authController.protect, userController.getUser)
  .put(authController.protect, userController.updateUser);

module.exports = router;
