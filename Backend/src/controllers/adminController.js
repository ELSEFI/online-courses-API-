const instructorRequest = require("../models/instructorRequest");
const instructorProfile = require("../models/instructorProfile");
const User = require("../models/User");
const Contact = require("../models/contactWithUs");
const { sendReplyEmail } = require("../services/emailSender");

exports.getAllInstructors = async (req, res) => {
  const instructors = await instructorProfile
    .find()
    .populate("userId", "name email profileImage")
    .sort({ createdAt: -1 });
  if (instructors.length === 0)
    return res.status(200).json({ message: "Not Instructors Founded!" });
  res.status(200).json(instructors);
};

exports.getInstructor = async (req, res) => {
  try {
    const instructor = await instructorProfile
      .findById(req.params.instructorId)
      .populate("userId", "name email profileImage");
    if (!instructor)
      return res.status(404).json({ message: "Not Instructor With That Id" });

    res.status(200).json(instructor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.removeInstructor = async (req, res) => {
  try {
    const instructor = await instructorProfile.findById(
      req.params.instructorId
    );
    if (!instructor)
      return res.status(400).json({ message: "No Instructor Founded" });

    await User.findByIdAndUpdate(instructor.userId, { role: "user" });
    await instructorProfile.findByIdAndDelete(req.params.instructorId);

    res.status(200).json({ message: "instructor Has Been Removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.addInstructor = async (req, res) => {
  const {
    name,
    email,
    password,
    bioEn,
    bioAr,
    jobTitleEn,
    jobTitleAr,
    experienceYears,
  } = req.body;

  if (
    !name ||
    !email ||
    !password ||
    !bioEn ||
    !bioAr ||
    !jobTitleEn ||
    !jobTitleAr ||
    !experienceYears
  )
    return res.status(400).json({ message: "All Inputs Required" });

  if (!req.file) {
    return res.status(400).json({
      message: "CV file is required",
    });
  }
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User Already Exist" });

    user = new User({
      name,
      email,
      password,
      role: "instructor",
      emailVerified: true,
    });
    await user.save();

    const instructor = await instructorProfile.create({
      userId: user._id,
      bio: {
        en: bioEn,
        ar: bioAr,
      },
      experienceYears,
      jobTitle: {
        en: jobTitleEn,
        ar: jobTitleAr,
      },
      cvFile: req.file.filename,
    });

    res.status(200).json({ message: "Instructor Created Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

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
      return res.status(400).json({
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 });
    if (users.length === 0)
      return res.status(404).json({ message: "No Users" });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).json({ message: "No User With That Id" });

    if (user.role === "admin" || user.role === "instructor")
      return res.status(400).json({ message: "That Id Not Regular User" });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.addUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All Inputs Required" });

  try {
    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ message: "User Already Signed Up" });

    user = new User({
      name,
      email,
      password,
      emailVerified: true,
    });
    await user.save();

    res.status(200).json({ message: "User Created Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "Not User Founded" });

    user.status = !user.status;
    await user.save();
    res.status(200).json({ message: "User Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(400).json({ message: "User Not Founded" });
    const instructor = await instructorProfile.findOne({ userId: user._id });
    if (!instructor) {
      await User.findByIdAndDelete(user._id);
      return res.status(200).json({ message: "User Deleted Successfully" });
    }

    await instructorProfile.findByIdAndDelete(instructor._id);
    await User.findByIdAndDelete(user._id);

    res.status(200).json({ message: "User Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Contact.find();
    if (messages.length === 0)
      return res.status(400).json({ message: "No Messages Yet!" });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.messageId);
    if (!message)
      return res.status(400).json({ message: "No Message Founded" });

    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.messageId).select(
      "email"
    );
    const { reply } = req.body;
    if (!reply)
      return res.status(400).json({ message: "You Must Fill a reply input" });
    await sendReplyEmail(message.email, reply);

    res.status(200).json({ message: "Reply sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteMessages = async (req, res) => {
  try {
    await Contact.deleteMany();
    res.status(200).json({ message: "Messages Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Contact.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message Not Found" });
    await Contact.findByIdAndDelete(message._id);
    res.status(200).json({ message: "Message Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
