const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

const cors = require("cors");
dotenv.config();
const connectDB = require("./src/config/db");
// ==ROUTES == //
const userRoutes = require("./src/Routes/userRoutes");
const adminRoutes = require("./src/Routes/adminRoutes");
// ==ROUTES == //

const app = express();

app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;

// CONNECT TO DATABASE
connectDB();
// CONNECT TO DATABASE

app.use(
  "/cvs",
  (req, res, next) => {
    // Only for PDF files
    if (req.path.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
    }
    next();
  },
  express.static(path.join(__dirname, "public/cvs"))
);
app.use(express.static("public"));

// ROUTES

// USERS //
app.use("/api/v1/users", userRoutes);
// USERS //

// ADMIN //
app.use("/api/v1/admin",adminRoutes)
// ADMIN //

// ROUTES
app.get("/", (req, res) => {
  res.send("Welcome To Online Courses");
});

app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});
