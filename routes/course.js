const express = require("express");
const router = express.Router();
const checkAuth = require("../middileware/checkAuth");
const Course = require("../model/Course");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const Student = require("../model/Student");
const { error } = require("console");
const Fee = require("../model/Fee");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // specify folder for uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/; // allowed file types
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "File type not supported! Only JPEG, JPG, and PNG are allowed."
        )
      );
    }
  },
});

// Add new course route
router.post("/add-course", checkAuth, upload.single("image"), (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    // Upload image to Cloudinary
    cloudinary.uploader.upload(req.file.path, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Error uploading image to Cloudinary" });
      }

      // Create a new course
      const newCourse = new Course({
        _id: new mongoose.Types.ObjectId(),
        courseName: req.body.courseName,
        price: req.body.price,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        uId: verify.uId,
        imageUrl: result.secure_url,
        imageId: result.public_id,
      });

      // Save the course to the database
      newCourse
        .save()
        .then((result) => {
          res.status(200).json({
            message: "Course added successfully!",
            newCourse: result,
          });
        })
        .catch((err) => {
          res.status(500).json({
            error: "Error saving course to database",
            details: err,
          });
        });
    });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

// Example of a GET all courses for any authenticated user

// router.get('/all-courses', checkAuth, (req, res) => {
//     const token = req.headers.authorization.split(" ")[1];
//     const verify = jwt.verify(token, 'institude management college');

//     // Fetch all courses belonging to the authenticated user
//     Course.find({ uId: verify.uId })
//         .then(courses => {
//             res.status(200).json({
//                 courses: courses
//             });
//         })
//         .catch(err => {
//             res.status(500).json({
//                 error: 'Error fetching courses',
//                 details: err
//             });
//         });
// });

router.get("/all-courses", checkAuth, (req, res) => {
  try {
    // Check if the Authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Authorization token is missing" });
    }
    const token = req.headers.authorization.split(" ")[1];

    // Verify the token
    const verify = jwt.verify(token, "institude management college");

    // Fetch all courses belonging to the authenticated user
    Course.find({ uId: verify.uId })
      .then((courses) => {
        res.status(200).json({
          courses: courses,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: "Error fetching courses",
          details: err.message,
        });
      });
  } catch (err) {
    // Handle errors from JWT verification and token splitting
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid or malformed token" });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

// Example of a GET course-details for any user

router.get("/course-detail/:id", checkAuth, (req, res) => {
  Course.findById(req.params.id)
    .select(
      "_id courseName description price startDate endDate imageId imageUrl uId"
    )
    .then((course) => {
      if (!course) {
        return res.status(404).json({
          error: "Course not found",
        });
      }

      // Find students associated with the course
      Student.find({ courseId: req.params.id })
        .then((students) => {
          res.status(200).json({
            course: course, // Return course details
            students: students, // Return list of students
          });
        })
        .catch((err) => {
          res.status(500).json({
            error: "Error fetching students",
            details: err.message,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        error: "Error fetching course",
        details: err.message,
      });
    });
});

//         OR

// Example of a GET single course by ID for any user
// router.get('/course-details/:id', checkAuth, (req, res) => {

//     // Fetch the course by ID
//     Course.findById(req.params.id)
//         .select('_id courseName price startDate endDate imageId imageUrl uId')
//         .then(course => {
//             if (!course) {
//                 return res.status(404).json({
//                     message: 'Course not found'
//                 });
//             }
//             res.status(200).json({
//                 course: course
//             });
//         })
//         .catch(err => {
//             res.status(500).json({
//                 error: 'Error fetching course details',
//                 details: err
//             });
//         });
// });

// Delete course by ID
router.delete("/:id", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "institude management college");

  Course.findById(req.params.id)
    .then((course) => {
      if (!course) {
        return res.status(404).json({
          msg: "Course not found",
        });
      }

      if (course.uId === verify.uId) {
        // If the user ID matches, proceed to delete the course
        Course.findByIdAndDelete(req.params.id)
          .then(() => {
            // Delete the image from cloudinary after deleting the course
            cloudinary.uploader.destroy(
              course.imageId,
              (err, result, deletedImage) => {
                Student.deleteMany({ courseId: req.params.id });
                if (err) {
                  return res.status(500).json({
                    msg: "Error deleting image from Cloudinary",
                    error: err,
                  });
                }

                res.status(200).json({
                  msg: "Course and associated image deleted successfully",
                  result: result,
                });
              }
            );
          })
          .catch((err) => {
            res.status(500).json({
              msg: "Error deleting the course",
              error: err,
            });
          });
      } else {
        res.status(403).json({
          msg: "Unauthorized action",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        msg: "Error fetching course",
        error: err,
      });
    });
});

// Update the course
router.put("/:id", checkAuth, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    Course.findById(req.params.id)
      .then((course) => {
        if (!course) {
          return res.status(404).json({
            error: "Course not found",
          });
        }

        // Check if the user is eligible to update the course
        if (verify.uId != course.uId) {
          return res.status(500).json({
            error: "You are not authorized to update this course",
          });
        }

        // Handle image update if a new image is uploaded
        if (req.file) {
          // First, delete the old image from Cloudinary
          cloudinary.uploader.destroy(course.imageId, (err, deletedImage) => {
            if (err) {
              return res.status(500).json({
                error: "Error deleting old image from Cloudinary",
                details: err,
              });
            }

            // Upload the new image to Cloudinary
            cloudinary.uploader.upload(req.file.path, (err, result) => {
              if (err) {
                return res.status(500).json({
                  error: "Error uploading new image to Cloudinary",
                  details: err,
                });
              }

              // Update course data with new image
              const updateData = {
                courseName: req.body.courseName || course.courseName,
                price: req.body.price || course.price,
                description: req.body.description || course.description,
                startDate: req.body.startDate || course.startDate,
                endDate: req.body.endDate || course.endDate,
                imageUrl: result.secure_url,
                imageId: result.public_id,
              };

              // Update course in database
              Course.findByIdAndUpdate(req.params.id, updateData, { new: true })
                .then((updatedCourse) => {
                  res.status(200).json({
                    message: "Course updated successfully!",
                    updatedCourse: updatedCourse,
                  });
                })
                .catch((err) => {
                  res.status(500).json({
                    error: "Error updating course in database",
                    details: err,
                  });
                });
            });
          });
        } else {
          // If no new image is uploaded, just update the course details
          const updateData = {
            courseName: req.body.courseName || course.courseName,
            price: req.body.price || course.price,
            description: req.body.description || course.description,
            startDate: req.body.startDate || course.startDate,
            endDate: req.body.endDate || course.endDate,
            imageUrl: course.imageUrl,
            imageId: course.imageId,
          };

          // Update course in database
          Course.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .then((updatedCourse) => {
              res.status(200).json({
                message: "Course updated successfully!",
                updatedCourse: updatedCourse,
              });
            })
            .catch((err) => {
              res.status(500).json({
                error: "Error updating course in database",
                details: err,
              });
            });
        }
      })
      .catch((err) => {
        res.status(500).json({
          error: "Error fetching course",
          details: err,
        });
      });
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
});

// Get the latest 5 course details
router.get("/latest-course", checkAuth, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    // Find the latest 5 courses for the authenticated user (based on uId)
    Course.find({ uId: verify.uId })
      .sort({ $natural: -1 }) // Sort by most recent
      .limit(5) // Limit to 5 results
      .then((result) => {
        res.status(200).json({
          courses: result, // Return the courses array
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: "Error fetching courses",
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

// home api

// router.get("/home", checkAuth, async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     const verify = jwt.verify(token, "institude management college");

//     const newFees = await Course.find({ uId: verify.uId })
//       .sort({ $natural: -1 })
//       .limit(4);

//     const newStudent = await Student.find({ uId: verify.uId })
//       .sort({ $natural: -1 })
//       .limit(4);

//     const totalCourse = await Course.countDocuments({ uId: verify.uId });
//     const totalStudent = await Student.countDocuments({ uId: verify.uId });

//     const totalAmountResult = await Fee.aggregate([
//       { $match: { uId: verify.uId } },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);
//     const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;
//     res.status(200).json({
//       fees: newFees,
//       students: newStudent,
//       totalCourse: totalCourse,
//       totalStudent: totalStudent,
//       totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
//     });
//   } catch (err) {
//     console.error("🔥 Error fetching home data:", err); // Log the exact error
//     res.status(500).json({ error: err.message || "Something went wrong" });
//   }
// });

router.get("/home", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    const newFees = await Course.find({ uId: verify.uId })
      .sort({ $natural: -1 })
      .limit(4);

    const newStudent = await Student.find({ uId: verify.uId })
      .sort({ $natural: -1 })
      .limit(4);

    const totalCourse = await Course.countDocuments({ uId: verify.uId });
    const totalStudent = await Student.countDocuments({ uId: verify.uId });

    const totalAmountResult = await Fee.aggregate([
      { $match: { uId: verify.uId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalAmount =
      totalAmountResult.length > 0 ? totalAmountResult[0].total : 0;

    res.status(200).json({
      courses: newFees, // ✅ Fixed variable name
      students: newStudent,
      totalCourse: totalCourse,
      totalStudent: totalStudent,
      totalAmount: totalAmount,
    });
  } catch (err) {
    console.error("🔥 Error fetching home data:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
});

module.exports = router;
