const express = require("express");
const authController = require("../controllers/authController");
const { verifyEmail } = require("../Middleware/verifyEmail");
const router = express.Router();
const protected = require("../Middleware/jwtMiddleware");
const {upload,resizeProfileImage} = require("../middleware/uploadImage");

// ROUTES
router.post("/register", authController.register);
router.post("/verify-email", verifyEmail);
router.post("/login", authController.login);
router.post("/google", authController.loginGoogle);
router.post("/forget-password", authController.forgetPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.put(
  "/update-profile",
  protected,
  upload.single("profileImage"),
  resizeProfileImage,
  authController.updateProfile
);
router.post("/logout", protected, authController.logout);
router.get("/me", protected, authController.profile);

module.exports = router;
