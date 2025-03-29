const express = require("express");
const router = express.Router();
const checkAuth = require("../middileware/checkAuth");
const Student = require("../model/Student");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const Course = require("../model/Course");
const Fee = require("../model/Fee");
// const Course = require('../model/Course')

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
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

//Add new student route
// router.post('/add-student', checkAuth, upload.single('image'), (req, res) => {
//     try {
//         const token = req.headers.authorization.split(" ")[1];
//         const verify = jwt.verify(token, 'institude management college');

//         // Check if file exists
//         if (!req.file) {
//             return res.status(400).json({ error: 'Image is required' });
//         }

//         // Upload image to Cloudinary
//         cloudinary.uploader.upload(req.file.path, { folder: 'students' }, (err, result) => {
//             if (err) {
//                 return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
//             }

//             // Create a new student
//             const newStudent = new Student({
//                 _id: new mongoose.Types.ObjectId(),
//                 fullName: req.body.fullName,
//                 phone: req.body.phone,
//                 email: req.body.email,
//                 address: req.body.address,
//                 imageUrl: result.secure_url,
//                 imageId: result.public_id,
//                 uId: verify.uId
//             });

//             // Save the student to the database
//             newStudent.save()
//                 .then(result => {
//                     res.status(200).json({
//                         message: 'Student added successfully!',
//                         newStudent: result
//                     });
//                 })
//                 .catch(err => {
//                     res.status(500).json({
//                         error: 'Error saving student to database',
//                         details: err
//                     });
//                 });
//         });
//     } catch (err) {
//         if (err.name === 'JsonWebTokenError') {
//             return res.status(401).json({ error: 'Invalid token' });
//         }
//         res.status(401).json({ error: 'Unauthorized' });
//     }
// });

// router.post('/add-student', checkAuth, upload.single('image'), (req, res) => {
//     try {

//         // Validate required fields
//         const { fullName, phone, email, address, courseId } = req.body;
//         if (!courseId || !address) {
//             return res.status(400).json({ error: 'courseId and address are required.' });
//         }

//         const token = req.headers.authorization.split(" ")[1];
//         const verify = jwt.verify(token, 'institude management college');

//         // Check if file exists
//         if (!req.file) {
//             return res.status(400).json({ error: 'Image is required' });
//         }

//         // Upload image to Cloudinary
//         cloudinary.uploader.upload(req.file.path, { folder: 'students' }, (err, result) => {
//             if (err) {
//                 return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
//             }

//             // Create a new student
//              const newStudent = new Student({
//                 _id: new mongoose.Types.ObjectId(),
//                 fullName: req.body.fullName,
//                 phone: req.body.phone,
//                 email: req.body.email,
//                 address: req.body.address,
//                 imageUrl: result.secure_url,
//                 imageId: result.public_id,
//                 uId: verify.uId
//             });

//             // Save the student to the database
//             newStudent.save()
//                 .then(result => {
//                     res.status(200).json({
//                         message: 'Student added successfully!',
//                         newStudent: result
//                     });
//                 })
//                 .catch(err => {
//                     res.status(500).json({
//                         error: 'Error saving student to database',
//                         details: err
//                     });
//                 });
//         });
//     } catch (err) {
//         if (err.name === 'JsonWebTokenError') {
//             return res.status(401).json({ error: 'Invalid token' });
//         }
//         res.status(401).json({ error: 'Unauthorized' });
//     }
// });

// router.post("/add-student", checkAuth, upload.single("image"), (req, res) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     const verify = jwt.verify(token, "institude management college");

//     // Trim keys and values in req.body to remove accidental spaces
//     const cleanedBody = {};
//     Object.keys(req.body).forEach((key) => {
//       cleanedBody[key.trim()] =
//         typeof req.body[key] === "string"
//           ? req.body[key].trim()
//           : req.body[key];
//     });

//     const { studentName, phone, email, address, courseId } = cleanedBody; // Use the cleaned body now
//     if (!address || !courseId) {
//       return res
//         .status(400)
//         .json({ error: "Address and courseId are required." });
//     }

//     // Check if file exists
//     if (!req.file) {
//       return res.status(400).json({ error: "Image is required" });
//     }

//     // Upload image to Cloudinary
//     cloudinary.uploader.upload(
//       req.file.path,
//       { folder: "students" },
//       (err, result) => {
//         if (err) {
//           return res
//             .status(500)
//             .json({ error: "Error uploading image to Cloudinary" });
//         }

//         // Create a new student
//         const newStudent = new Student({
//           _id: new mongoose.Types.ObjectId(),
//           studentName,
//           phone,
//           email,
//           address,
//           courseId,
//           imageUrl: result.secure_url,
//           imageId: result.public_id,
//           uId: verify.uId,
//         });

//         // Save the student to the database
//         newStudent
//           .save()
//           .then((result) => {
//             res.status(200).json({
//               message: "Student added successfully!",
//               newStudent: result,
//             });
//           })
//           .catch((err) => {
//             res.status(500).json({
//               error: "Error saving student to database",
//               details: err,
//             });
//           });
//       }
//     );
//   } catch (err) {
//     if (err.name === "JsonWebTokenError") {
//       return res.status(401).json({ error: "Invalid token" });
//     }
//     res.status(401).json({ error: "Unauthorized" });
//   }
// });

//add student
router.post("/add-student", checkAuth, upload.single("image"), (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    // Trim keys and values in req.body to remove accidental spaces
    const cleanedBody = {};
    Object.keys(req.body).forEach((key) => {
      cleanedBody[key.trim()] =
        typeof req.body[key] === "string"
          ? req.body[key].trim()
          : req.body[key];
    });

    const { fullName, phone, email, address, courseId } = cleanedBody;
    if (!address || !courseId) {
      return res
        .status(400)
        .json({ error: "Address and courseId are required." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Upload image to Cloudinary
    cloudinary.uploader.upload(
      req.file.path,
      { folder: "students" },
      (err, result) => {
        if (err) {
          console.error("Cloudinary upload error:", err);
          return res
            .status(500)
            .json({ error: "Cloudinary upload failed", details: err.message });
        }

        // Create a new student
        const newStudent = new Student({
          _id: new mongoose.Types.ObjectId(),
          fullName,
          phone,
          email,
          address,
          courseId,
          imageUrl: result.secure_url,
          imageId: result.public_id,
          uId: verify.uId,
        });

        // Save the student to the database
        newStudent
          .save()
          .then((result) => {
            res.status(200).json({
              message: "Student added successfully!",
              newStudent: result,
            });
          })
          .catch((err) => {
            console.error("Database save error:", err);
            res.status(500).json({
              error: "Error saving student to database",
              details: err.message,
            });
          });
      }
    );
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    console.error("Unexpected error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

//get student details by id

// router.get('/student-detail/:id', checkAuth, (res, req) => {
//   const token = req.headers.authorization.split(" ")[1];
//   const verify = jwt.verify(token, "institude management college");
//   Student.findById(req.params.id)
//     .select("_id uId fullName phone email address courseId imageUrl imageId") // Removed the extra comma
//     .then((result) => {
//       Fee.find({ uId: verify.uId, courseId: result.courseId, phone: result.phone })
//         .then(feeData => {
//           res.status(200).json({
//             StudentDetail: result, feeDetail: feeData
//           })
//         })
//         .catch(err => {
//           console.log(err);
//           res.status(500).json({
//             error: err
//           })
//         })
//     })
//     .catch((err) => {
//       res.status(500).json({
//         error: err,
//       });
//     });
// })

router.get("/student-detail/:id", checkAuth, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    Student.findById(req.params.id)
      .select("_id uId fullName phone email address courseId imageUrl imageId")
      .then((result) => {
        if (!result) {
          return res.status(404).json({ message: "Student not found" });
        }

        Fee.find({
          uId: verify.uId,
          courseId: result.courseId,
          phone: result.phone,
        })
          .then((feeData) => {
            Course.findById(result.courseId)
              .then((courseDetail) => {
                res.status(200).json({
                  StudentDetail: result,
                  feeDetail: feeData,
                  courseDetail: courseDetail,
                });
              })
              .catch((err) => {
                console.error(err);
                res
                  .status(500)
                  .json({ error: "Error fetching fee details", details: err });
              });
          })
          .catch((err) => {
            console.error(err);
            res
              .status(500)
              .json({ error: "Error fetching fee details", details: err });
          });
      })
      .catch((err) => {
        console.error(err);
        res
          .status(500)
          .json({ error: "Error fetching student details", details: err });
      });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized access", error: err });
  }
});

//get all-students
router.get("/all-students", checkAuth, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    // Fetch all students belonging to the authenticated user
    Student.find({ uId: verify.uId }) // Use 'Student' model instead of 'Students'
      .select("_id uId fullName phone email address courseId imageUrl imageId") // Removed the extra comma
      .then((students) => {
        res.status(200).json({
          students: students,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

router.get("/all-students/:courseId", checkAuth, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    // Fetch all students in a particular course and belonging to the authenticated user
    Student.find({ uId: verify.uId, courseId: req.params.courseId }) // Querying both uId and courseId
      .select("_id uId fullName phone email address courseId imageUrl imageId") // Selecting required fields
      .then((students) => {
        res.status(200).json({
          students: students,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: err,
        });
      });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

//deleted student

router.delete("/:id", checkAuth, (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const verify = jwt.verify(token, "institude management college");

  Student.findById(req.params.id)
    .then((student) => {
      if (!student) {
        return res.status(404).json({
          msg: "Student not found",
        });
      }

      if (student.uId === verify.uId) {
        // If the user ID matches, proceed to delete the course
        Student.findByIdAndDelete(req.params.id)
          .then(() => {
            // Delete the image from cloudinary after deleting the course
            cloudinary.uploader.destroy(student.imageId, (err, result) => {
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
            });
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

// Update the student
router.put("/:id", checkAuth, upload.single("image"), (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    Student.findById(req.params.id)
      .then((student) => {
        if (!student) {
          return res.status(404).json({
            error: "student not found",
          });
        }

        // Check if the user is eligible to update the student
        if (verify.uId !== student.uId) {
          return res.status(403).json({
            error: "You are not authorized to update this student",
          });
        }

        // Handle image update if a new image is uploaded
        if (req.file) {
          // First, delete the old image from Cloudinary
          cloudinary.uploader.destroy(student.imageId, (err) => {
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

              // Assign new imageUrl and imageId
              const imageUrl = result.secure_url; // URL of the uploaded image
              const imageId = result.public_id; // Image ID in Cloudinary

              // Update student data with new image
              const updateData = {
                fullName: req.body.fullName,
                phone: req.body.phone,
                email: req.body.email,
                address: req.body.address,
                imageUrl: imageUrl, // Use new imageUrl
                imageId: imageId, // Use new imageId
                uId: verify.uId,
              };

              // Update student in database
              Student.findByIdAndUpdate(req.params.id, updateData, {
                new: true,
              })
                .then((updatedStudent) => {
                  res.status(200).json({
                    message: "student updated successfully!",
                    updatedStudent: updatedStudent,
                  });
                })
                .catch((err) => {
                  res.status(500).json({
                    error: "Error updating student in database",
                    details: err,
                  });
                });
            });
          });
        } else {
          // If no new image is uploaded, just update the student details
          const updateData = {
            fullName: req.body.fullName,
            phone: req.body.phone,
            email: req.body.email,
            address: req.body.address,
            imageUrl: student.imageUrl, // Keep the existing image URL
            imageId: student.imageId, // Keep the existing image ID
            uId: verify.uId,
          };

          // Update student in database
          Student.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .then((updatedStudent) => {
              res.status(200).json({
                message: "Student updated successfully!",
                updatedStudent: updatedStudent,
              });
            })
            .catch((err) => {
              res.status(500).json({
                error: "Error updating student in database",
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

// Get the latest 5 student details
router.get("/latest-student", checkAuth, (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "institude management college");

    // Find the latest 5 students for the authenticated user (based on uId)
    Student.find({ uId: verify.uId })
      .sort({ $natural: -1 }) // Sort by the most recent
      .limit(5) // Limit to 5 results
      .then((result) => {
        res.status(200).json({
          students: result, // Return the students array
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: "Error fetching students",
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
