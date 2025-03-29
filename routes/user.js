const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const User = require('../model/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { error } = require('console');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// // Endpoint to handle file upload and user creation
// router.post('/signup', upload.single('image'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).send('No file uploaded.');
//     }

//     User.find({ email: req.body.email })
//         .then(users => {
//             if (users.length > 0) {
//                 return res.status(500).json({
//                     error: 'email alredy regidted - chouse another email....'
//                 })
//             }



//             // Upload the file to Cloudinary
//             cloudinary.uploader.upload(req.file.path, (err, result) => {
//                 if (err) {
//                     console.error('Error uploading to Cloudinary:', err);
//                     return res.status(500).send('Failed to upload to Cloudinary.');
//                 }

//                 bcrypt.hash(req.body.password, 10, (err, hash) => {
//                     if (err) {
//                         return res.status(500).json({
//                             error: err
//                         })
//                     }
//                     // Create a new user with the Cloudinary result
//                     const newUser = new User({
//                         _id: new mongoose.Types.ObjectId(),
//                         fullName: req.body.fullName,
//                         email: req.body.email,
//                         phone: req.body.phone,
//                         password: hash,
//                         imageUrl: result.secure_url,
//                         imageId: result.public_id,
//                     });

//                     // Save the new user to the database
//                     newUser.save()
//                         .then(userResult => {
//                             // Delete the local file after upload to Cloudinary
//                             fs.unlink(req.file.path, (err) => {
//                                 if (err) {
//                                     console.error('Error deleting local file:', err);
//                                 } else {
//                                     console.log('Local file deleted:', req.file.path);
//                                 }
//                             });

//                             // Send the final response after user is saved
//                             res.status(200).json({
//                                 success: true,
//                                 message: 'File uploaded and user created successfully',
//                                 user: userResult,
//                                 cloudinaryUrl: result.secure_url
//                             });
//                         })
//                         .catch(err => {
//                             console.log(err);
//                             res.status(500).json({ error: err });
//                         });


//                 })


//             });
//         });
// });

// Endpoint to handle file upload and user creation
router.post('/signup', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    User.find({ email: req.body.email })
        .then(users => {
            if (users.length > 0) {
                return res.status(409).json({
                    error: 'Email already registered - choose another email.'
                });
            }

            // Upload the file to Cloudinary
            cloudinary.uploader.upload(req.file.path, (err, result) => {
                if (err) {
                    console.error('Error uploading to Cloudinary:', err);
                    return res.status(500).send('Failed to upload to Cloudinary.');
                }

                console.log('Cloudinary result:', result);

                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        console.error('Error hashing password:', err);
                        return res.status(500).json({
                            error: 'Failed to hash the password.'
                        });
                    }

                    // Create a new user with the Cloudinary result
                    const newUser = new User({
                        _id: new mongoose.Types.ObjectId(),
                        fullName: req.body.fullName,
                        email: req.body.email,
                        phone: req.body.phone,
                        password: hash,
                        imageUrl: result.secure_url,
                        imageId: result.public_id,
                    });

                    // Save the new user to the database
                    newUser.save()
                        .then(userResult => {
                            // Delete the local file after upload to Cloudinary
                            fs.unlink(req.file.path, (err) => {
                                if (err) {
                                    console.error('Error deleting local file:', err);
                                } else {
                                    console.log('Local file deleted:', req.file.path);
                                }
                            });

                            // Send the final response after user is saved
                            res.status(200).json({
                                success: true,
                                message: 'File uploaded and user created successfully',
                                user: userResult,
                                cloudinaryUrl: result.secure_url
                            });
                        })
                        .catch(err => {
                            console.error('Error saving user to database:', err);
                            res.status(500).json({ error: err });
                        });
                });
            });
        })
        .catch(err => {
            console.error('Error finding user in database:', err);
            res.status(500).json({ error: err });
        });
});


//login 
router.post('/login', (req, res) => {
    User.find({ email: req.body.email })
        .then(users => {
            // console.log(users[0],req.body.password)
            if (users.length == 0) {
                return res.status(500).json({
                    msg: "email is not registed fill the correct email....."
                })
            }
            bcrypt.compare(req.body.password, users[0].password, (err, result) => {
                if (!result) {
                    return res.status(500).json({
                        error: 'password maching fail...'
                    })
                }
                const token = jwt.sign({
                    email: users[0].email,
                    fulltName: users[0].fullName,
                    phone: users[0].phone,
                    uId: users[0]._id
                },
                    'institude management college',
                    {
                        expiresIn: '365d'
                    }
                );
                res.status(200).json({
                    _id: users[0]._id,
                    fullName: users[0].fullName,
                    phone: users[0].phone,
                    email: users[0].email,
                    imageUrl: users[0].imageUrl,
                    imageId: users[0].imageId,
                    token: token
                })
            })
        });

});












module.exports = router;