const express = require("express");
const adminController = require("../controllers/adminController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");

const router = express.Router();
router.use(protected, restrictTo("admin"));

router.get("/instructors", adminController.getAllInstructors);
router.post("/instructors/add-instructor", adminController.addInstructor);
router.get("/instructors/:instructorId", adminController.getInstructor);
router.delete(
  "/instructors/:instructorId/delete-instructor",
  adminController.removeInstructor
);

router.get("/users", adminController.getAllUsers);
router.post("/users/add-user", adminController.getAllUsers);
router.get("/users/:userId", adminController.getUser);
router.delete("/users/:userId", adminController.deleteUser);
router.delete("/users/:userId/update-status", adminController.updateStatus);

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

router.get("/users/messages", adminController.getAllMessages);
router.delete("/users/messages/delete-message", adminController.deleteMessage);
router.get("/users/messages/:messageId", adminController.getMessage);
router.post(
  "/users/messages/:messageId/reply-message",
  adminController.replyMessage
);
router.delete(
  "/users/messages/:messageId/delete-message",
  adminController.deleteMessages
);

module.exports = router;
