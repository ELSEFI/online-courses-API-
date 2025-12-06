const express = require("express");
const adminController = require("../controllers/adminController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/users/requests",
  protected,
  restrictTo("admin"),
  adminController.getAllRequests
);

router.get(
  "/users/requests/:id",
  protected,
  restrictTo("admin"),
  adminController.getRequest
);

module.exports = router;
