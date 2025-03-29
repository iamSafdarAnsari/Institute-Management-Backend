const express = require("express");
const checkAuth = require("../middileware/checkAuth");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Fee = require("../model/Fee");
const mongoose = require("mongoose");

// Add a new fee
router.post("/add-fee", checkAuth, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");
    console.log("Token verified:", verify);
    const newFee = new Fee({
      _id: new mongoose.Types.ObjectId(),
      fullName: req.body.fullName,
      phone: req.body.phone,
      courseId: req.body.courseId,
      uId: verify.uId,
      amount: req.body.amount,
      remark: req.body.remark,
      createdAt: req.body.createdAt,
    });
    newFee
      .save()
      .then((result) => {
        res.status(200).json({
          message: "Fee added successfully",
          newFee: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          details: err,
        });
      });
  } catch (err) {
    res.status(500).json({
      error: "Invalid token or server error",
      details: err.message,
    });
  }
});

// Get all payment collection for any user
router.get("/payment-history", checkAuth, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    // Use the correct token verification value (verify.uId)
    Fee.find({ uId: verify.uId })
      .then((result) => {
        res.status(200).json({
          paymentHistory: result,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Error fetching payment history",
          details: err.message,
        });
      });
  } catch (err) {
    res.status(500).json({
      error: "Invalid token or server error",
      details: err.message,
    });
  }
});

// Get all payment collection for one student at one course
router.get("/all-payment", checkAuth, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    // Use the correct token verification value (verify.uId)
    Fee.find({
      uId: verify.uId,
      courseId: req.query.objectId,
      phone: req.query.phone,
    })
      .then((result) => {
        res.status(200).json({
          paymentHistory: result,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Error fetching payment history",
          details: err.message,
        });
      });
  } catch (err) {
    res.status(500).json({
      error: "Invalid token or server error",
      details: err.message,
    });
  }
});

module.exports = router;
