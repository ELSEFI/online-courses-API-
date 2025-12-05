const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { verifyGoogleToken } = require("../services/googleAuthService");
const { sendEmail } = require("../services/emailSender");
const { sendResetPasswordEmail } = require("../services/resetPasswordEmail");
const { uploadToCloudinary } = require("../services/cloudinaryUpload");
const crypto = require("crypto");

const createToken = (id, role, tokenV) => {
  const payload = { id, role, tokenV };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email Already Exits" });
    const code = Math.floor(100000 + Math.random() * 900000);
    user = new User({
      name,
      email,
      password,
      verificationCode: code,
      verificationCodeExpire: Date.now() + 1000 * 60 * 10,
    });
    await user.save();
    await sendEmail(user.email, code);

    res.status(201).json({
      message:
        "Registered successfully. Please check your email for the verification code.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Incorrect Email or Password" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect Email or Password" });

    if (!user.emailVerified)
      return res.status(401).json({ message: "Please Confirm Your Account" });
    user.password = undefined;

    const token = createToken(user._id, user.role, user.tokenVersion);
    res.status(200).json({
      message: "Login Successfully",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.loginGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    // Verify Token From Google
    const googleUser = await verifyGoogleToken(token);

    if (!googleUser.email)
      return res.status(400).json({ message: "Invalid Google account data" });

    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = await User.create({
        name: googleUser.name || googleUser.email.split("@")[0],
        email: googleUser.email,
        googleId: googleUser.googleId,
        profileImage: googleUser.profileImage,
        password: Math.random().toString(36).substring(2, 10),
      });
    }
    user.password = undefined;

    const jwtToken = createToken(user._id, user.role, user.tokenVersion);
    res.status(200).json({
      message: "Logged in With Google Successful",
      user,
      token: jwtToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google Login Error" });
  }
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User Not Found!" });

    const realToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(realToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/reset-password/${realToken}`;

    await sendResetPasswordEmail(user.email, resetURL);

    res
      .status(201)
      .json({ message: "Check your email for password reset link" });
    console.log(realToken);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(401).json({ message: "Token Invalid Or Expired" });

    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword)
      return res
        .status(400)
        .json({ message: "Password and Confirm Password Must Be Match" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.tokenVersion += 1;
    await user.save();
    res.status(200).json({ message: "Password Reset Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User Not Found" });
    if (user.emailVerified)
      return res.status(400).json({ message: "This Email Already Verified" });

    const code = Math.floor(100000 + Math.random() * 900000);
    user.verificationCode = code;
    user.verificationCodeExpire = Date.now() + 1000 * 60 * 10;
    await user.save();
    await sendEmail(user.email, code);
    res.status(201).json({ message: "Verification code resent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User no exist." });
    const imageUrl = user.profileImage
      ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${user.profileImage}`
      : null;
    res.status(200).json({ user, imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    if (req.body.password || req.body.passwordConfirm)
      return res
        .status(400)
        .json({ message: "Not able to Change Password At this Route" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).json({ message: "User Not found" });

    const { name, email} = req.body;
    if (name) user.name = name;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "users");

      user.profileImage = result.public_id;
    }
    if (email && email !== user.email) {
      user.email = email;
      user.emailVerified = false;
      const code = Math.floor(100000 + Math.random() * 900000);
      user.verificationCode = code;
      user.verificationCodeExpire = Date.now() + 1000 * 60 * 10;
      await sendEmail(user.email, code);
      await user.save();
      return res.status(200).json({
        message:
          "Profile updated successfully and Please Check Your Email To Verify",
        user,
      });
    }
    await user.save();
    return res.status(200).json({
      message: "Profile updated successfully",
      user,
      imageUrl: user.profileImage
        ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${user.profileImage}`
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmNewPassword)
      return res.status(400).json({ message: "Three Fields Required!" });
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch)
      return res.status(400).json({ message: "Wrong Old Password" });
    if (newPassword !== confirmNewPassword)
      return res
        .status(400)
        .json({ message: "Password and Confirm Password Must be Matching" });

    user.password = newPassword;
    user.tokenVersion += 1;
    await user.save();
    res.status(200).json({ message: "Updated Password Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    user.tokenVersion += 1;
    await user.save();
    res.cookie("jwt", "LoggedOut", {
      httpOnly: true,
      expires: new Date(Date.now() + 3 * 1000),
    });
    res.status(201).json({ message: "Logged out from all devices" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(400).json({ message: "User Not Exist" });

    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
