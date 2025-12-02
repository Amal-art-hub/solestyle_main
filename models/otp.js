const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    // User's email to associate the code
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        lowercase: true,
    },
    // The 6-digit code
    code: {
        type: String, 
        required: true,
    },
    // CRITICAL: TTL Index for automatic expiration
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 5 minutes * 60 seconds = 300 seconds
    },
});

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;