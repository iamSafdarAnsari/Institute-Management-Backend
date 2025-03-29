// const { type } = require('express/lib/response');

const mongoose = require('mongoose');

// Define the schema for User model
const userSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageId: { type: String, required: true }
});

// Export the User model
module.exports = mongoose.model('User', userSchema);
