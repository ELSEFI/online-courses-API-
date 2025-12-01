const expires = require("express");
const authController = require("../controllers/authController");
const router = expires.Router();

// ROUTES
router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;
