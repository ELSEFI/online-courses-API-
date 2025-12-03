const User = require("../models/User");
exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User Not Found!" });

  if (user.verificationCode !== Number(code))
    return res.status(400).json({ message: "Invalid Code!" });

  if (user.verificationCodeExpire < Date.now())
    return res.status(400).json({ message: "Code Expired!" });

  user.emailVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;
  await user.save();
  res.json({ message: "Email Verified Successfully!" });
};
