const expires = require("express");
const authController = require("../controllers/authController");

const router = expires.Router();

// ROUTE REGISTER (PUBLIC)
router.post("/register", authController.register);
