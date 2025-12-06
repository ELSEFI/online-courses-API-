const express = require("express");
const adminController = require("../controllers/adminController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");

const router = express.Router();
router.use(protected, restrictTo("admin"));

router.get("/users/requests", adminController.getAllRequests);
router.get("/users/requests/:requestId", adminController.getRequest);
router.patch(
  "/users/requests/:requestId/approve-request",
  adminController.acceptInstructor
);
router.patch(
  "/users/requests/:requestId/reject-request",
  adminController.rejectInstructor
);

module.exports = router;
