const mongoose = require('mongoose');

// Define the schema for Course model
const courseSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    courseName: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    startDate:{ type: String, required: true }, // Changed to Date type
    endDate: { type: String, required: true },   // Changed to Date type
    imageId: { type: String, required: true },
    imageUrl: { type: String, required: true },
    uId: { type: String, required: true },     // User ID or Instructor ID
});

// Export the Course model
module.exports = mongoose.model('Course', courseSchema);
