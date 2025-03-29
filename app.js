const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import route files
const userRoute = require("./routes/user");
const courseRoute = require("./routes/course");
const studentRoute = require("./routes/student");
const feeRoute = require("./routes/fee"); // Correctly import feeRoute

// Connect to the MongoDB database
mongoose
  .connect(
    "mongodb+srv://institute_management:Aamir78692@cluster0.bjo8o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Define route mappings
app.use("/user", userRoute);
app.use("/course", courseRoute);
app.use("/student", studentRoute);
app.use("/fee", feeRoute); // Use the correct variable name for feeRoute

// Catch-all route for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    msg: "Bad request",
  });
});

module.exports = app;
