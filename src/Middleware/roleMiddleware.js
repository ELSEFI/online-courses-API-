const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "You're not allowed to access this route" });
    }
    next();
  };
};
module.exports = restrictTo;
