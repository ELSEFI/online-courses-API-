const instructorRequest = require("../models/instructorRequest");
const fs = require("fs").promises;
const path = require("path");

exports.beInstructor = async (req, res) => {
  try {
    const { bio_ar, bio_en, experienceYears, jobTitle_ar, jobTitle_en } =
      req.body;
    if (!bio_en || !bio_ar) {
      return res.status(400).json({
        message: "Bio is required in both languages",
      });
    }

    if (!experienceYears || experienceYears < 0) {
      return res.status(400).json({
        message: "Valid experience years is required",
      });
    }

    if (!jobTitle_en || !jobTitle_ar) {
      return res.status(400).json({
        message: "Job title is required in both languages",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "CV file is required",
      });
    }

    const existingRequest = await instructorRequest.findOne({
      userId: req.user._id,
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        await fs.unlink(req.file.path);
        return res
          .status(400)
          .json({ message: "You already have a pending request" });
      }
      if (existingRequest.status === "approved") {
        await fs.unlink(req.file.path);
        return res
          .status(400)
          .json({ message: "You are already an instructor" });
      }
      if (existingRequest.cvURL) {
        const oldCvPath = path.join(
          __dirname,
          "..",
          "public",
          "cvs",
          existingRequest.cvURL
        );
        try {
          await fs.unlink(oldCvPath);
        } catch (err) {
          console.log("Old CV not found:", err.message);
        }
      }
      await instructorRequest.findByIdAndDelete(existingRequest._id);
    }

    const request = await instructorRequest.create({
      userId: req.user._id,
      bio: {
        en: bio_en,
        ar: bio_ar,
      },
      experienceYears,
      jobTitle: {
        en: jobTitle_en,
        ar: jobTitle_ar,
      },
      status: "pending",
      cvFile: req.file.filename,
    });

    await request.populate("userId", "name email profileImage");
    res.status(201).json({
      message: "Request submitted successfully",
      request: {
        ...request.toObject(),
        cvURL: `${req.protocol}://${req.get("host")}/cvs/${request.cvFile}`,
      },
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch((err) => console.log(err));
    }
    console.error(error);

    res.status(500).json({ message: "Server Error" });
  }
};
