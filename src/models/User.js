const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    role: {
      type: String,
      enum: ["admin", "instructor", "user"],
      default: "user",
    },
    profileImage: {
      type: String,
      default: "/profile/default-avatar.png",
    },
    googleId: {
      type: String,
      default: null,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: Number,
      default: null,
    },
    verificationCodeExpire: {
      type: Date,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateVerificationCode = function () {
  this.verificationCode = Math.floor(100000 + Math.random() * 900000);
  this.verificationCodeExpire = Date.now() + 5 * 60 * 1000;
  return this.verificationCode;
};
module.exports = mongoose.model("User", userSchema);
