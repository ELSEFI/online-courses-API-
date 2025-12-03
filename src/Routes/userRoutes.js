const express = require("express");
const authController = require("../controllers/authController");
const { verifyEmail } = require("../Middleware/verifyEmail");
const router = express.Router();
const protected = require("../Middleware/jwtMiddleware");

// ROUTES
router.post("/register", authController.register);
router.post("/verify-email", verifyEmail);
router.post("/login", authController.login);
router.post("/google", authController.loginGoogle);
router.post("/logout", protected, authController.logout);
router.get("/me", protected, authController.profile);

module.exports = router;
