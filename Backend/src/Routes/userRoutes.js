const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const { verifyEmail } = require("../Middleware/verifyEmail");
const router = express.Router();
const protected = require("../Middleware/jwtMiddleware");
const {
  uploadImage,
  resizeProfileImage,
} = require("../Middleware/uploadImage");
const uploadCvs = require("../Middleware/uploadCvs");

// ROUTES
router.post("/contact-with-us",userController.contactWithUs)
router.post("/register", authController.register);
router.post("/verify-email", verifyEmail);
router.post("/login", authController.login);
router.post("/google", authController.loginGoogle);
router.post("/forget-password", authController.forgetPassword);
router.post("/resend-verification", authController.resendVerification);
router.delete("/delete-me", protected, authController.deleteMe);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch(
  "/update-profile",
  protected,
  uploadImage.single("profileImage"),
  resizeProfileImage,
  authController.updateProfile
);
router.patch("/update-password", protected, authController.updatePassword);
router.post("/logout", protected, authController.logout);
router.get("/me", protected, authController.profile);
router.get("/:userId", authController.getUser);

router.post(
  "/be-instructor",
  protected,
  uploadCvs.single("cv"),
  userController.beInstructor
);

module.exports = router;
