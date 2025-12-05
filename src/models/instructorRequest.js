const mongoose = require("mongoose");
const instructorRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    experienceYears: {
      type: Number,
      required: true,
    },
    jobTitle: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    cvFile: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      en: String,
      ar: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InstructorRequest", instructorRequestSchema);
