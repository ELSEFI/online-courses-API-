const mongoose = require("mongoose");
const instructorProfileSchema = new mongoose.Schema(
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
    experience: {
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
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalCourses: {
      type: Number,
      default: 0,
    },
    socials: {
      facebook: String,
      linkedin: String,
      youtube: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InstructorProfile", instructorProfileSchema);
