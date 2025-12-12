const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protected = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (
    !token ||
    token.trim() === "" ||
    token === "undefined" ||
    token === "null"
  ) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user || decoded.tokenV !== user.tokenVersion) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err);
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

module.exports = protected;
