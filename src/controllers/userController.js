const express = require("express");
const instructorRequest = require("../models/instructorRequest");
const router = express.Router();

exports.beInstructor = async (req, res) => {
  try {
    const existingRequest = await instructorRequest.findById({
      userId: req.user._id,
    });
    const { bio, experienceYears, jobTitle } = req.body;
    if (existingRequest) {
      if (existingRequest.status === "pending")
        return res
          .status(400)
          .json({ message: "You already have a pending request" });
      if (existingRequest.status === "approved")
        return res
          .status(400)
          .json({ message: "You are already an instructor" });
      await instructorRequest.findByIdAndDelete(existingRequest._id);
    }

    const request = await instructorRequest.create({
      userId: req.user._id,
      bio,
      experienceYears,
      jobTitle,
    });
    res.status(201).json({
      message: "Request submitted successfully",
      request,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server Error" });
  }
};
