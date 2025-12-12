const express = require("express");
const adminController = require("../controllers/adminController");
const protected = require("../Middleware/jwtMiddleware");
const restrictTo = require("../Middleware/roleMiddleware");
const uploadCvs = require("../Middleware/uploadCvs");

const router = express.Router();
router.use(protected, restrictTo("admin"));

router.get("/instructors", adminController.getAllInstructors);
router.post(
  "/instructors/add-instructor",
  uploadCvs.single("cvFile"),
  adminController.addInstructor
);
router.get("/instructors/:instructorId", adminController.getInstructor);
router.delete(
  "/instructors/:instructorId/remove-instructor",
  adminController.removeInstructor
);

// Messages routes
router.get("/users/messages", adminController.getAllMessages);
router.delete(
  "/users/messages/delete-messages",
  adminController.deleteMessages
);
router.get("/users/messages/:messageId", adminController.getMessage);
router.post(
  "/users/messages/:messageId/reply-message",
  adminController.replyMessage
);
router.delete(
  "/users/messages/:messageId/delete-message",
  adminController.deleteMessage
);

// Users routes
router.get("/users", adminController.getAllUsers);
router.post("/users/add-user", adminController.addUser);
router.get("/users/:userId", adminController.getUser);
router.delete("/users/:userId", adminController.deleteUser);
router.patch("/users/:userId/update-status", adminController.updateStatus);

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
