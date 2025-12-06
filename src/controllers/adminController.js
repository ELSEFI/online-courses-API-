const instructorRequest = require("../models/instructorRequest");
const instructorProfile = require("../models/instructorProfile");
const User = require("../models/User");

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await instructorRequest
      .find()
      .populate("userId", "name email profileImage")
      .sort({ createdAt: -1 });
    if (requests.length === 0)
      return res.status(404).json({ message: "No Requests Found" });

    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await instructorRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Request No Found!" });
    await request.populate("userId", "name email profileImage");
    res.status(200).json({
      request: {
        ...request.toObject(),
        cvURL: `${req.protocol}://${req.get("host")}/cvs/${request.cvFile}`,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.acceptInstructor = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await instructorRequest.findById(requestId);

    if (!request)
      return res.status(400).json({ message: "No Request With That Id" });

    if (request.status !== "pending")
      return res
        .status(400)
        .json({ message: "That Request Already Processed" });

    request.status = "approved";
    await request.save();

    const instructor = await instructorProfile.create({
      userId: request.userId,
      bio: {
        en: request.bio.en,
        ar: request.bio.ar,
      },
      experienceYears: request.experienceYears,
      jobTitle: {
        en: request.jobTitle.en,
        ar: request.jobTitle.ar,
      },
      cvFile: request.cvFile,
    });
    await User.findByIdAndUpdate(request.userId, { role: "instructor" });

    res.status(201).json({
      message: "Instructor approved successfully",
      profile: instructor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.rejectInstructor = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await instructorRequest.findById(requestId);
    const { rejectionReason_en, rejectionReason_ar } = req.body;

    if (!rejectionReason_en || !rejectionReason_ar) {
      return res.status(404).json({
        message: "Rejection reason is required in both languages",
      });
    }

    if (!request)
      return res.status(404).json({ message: "No Request With That Id" });

    if (request.status !== "pending")
      return res
        .status(400)
        .json({ message: "That Request Already Processed" });

    request.status = "rejected";
    request.rejectionReason.en = rejectionReason_en;
    request.rejectionReason.ar = rejectionReason_ar;
    await request.save();

    res.status(201).json({
      message: "Instructor rejected",
      profile: request,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
