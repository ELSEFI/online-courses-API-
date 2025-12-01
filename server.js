const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const connectDB = require("./src/config/db");
// ==ROUTES == //
const userRoutes = require("./src/Routes/userRoutes");
// ==ROUTES == //

const app = express();

app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;

// CONNECT TO DATABASE
connectDB();
// CONNECT TO DATABASE
app.use(express.static("public"));

// ROUTES
app.use("api/v1/users", userRoutes);
// ROUTES
app.get("/", (req, res) => {
  res.send("Welcome To Online Courses");
});

app.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});
