const {
  getHomepageDate,
  sendVerificationEmail,
  generateOtp,
  checkExistingUser,
  createUser,
  resendOtpService,
  verifyOtpService
} = require("../../services/userService.js");

const env = require("dotenv").config();

const pageNotFound = (req, res) => {
  res.status(404).render("page-404");
};

// Load home page
const loadHomepage = async (req, res) => {
  try {
    const data = getHomepageDate();
    return res.render("home", data);
  } catch (error) {
    console.log("Home page not found");
    res.status(500).send("Server error");
  }
};

// Load signup page
const loadSignup = async (req, res) => {
  try {
    return res.render("signup");
  } catch (error) {
    console.log("signup page error :", error);
    res.status(500).send("Server Error");
  }
};

// Load OTP verification page
const loadVerifyOtp = (req, res) => {
  // Render the OTP page; any flash messages can be passed via query params if needed
  return res.render("verify-otp");
};

// Verify OTP and create user
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const result = await verifyOtpService(req.session, otp);
    
    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      redirectUrl: result.redirectUrl
    });
  } catch (error) {
    console.error('Error in verifyOtp controller:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during OTP verification.'
    });
  }
};

// Signup handler – generate OTP and redirect to verification page
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.json({ message: "Password do not match" });
    }
    const existingUser = await checkExistingUser(email);
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const otp = generateOtp();
    // Enhanced logging for OTP debugging
    console.log('========== OTP DEBUGGING ==========');
    console.log('Generated OTP:', otp);
    console.log('Email being sent to:', email);
    console.log('Session ID:', req.sessionID);
    console.log('Session data before email:', JSON.stringify(req.session, null, 2));
    
    const emailSent = await sendVerificationEmail(email, otp);
    console.log('Email sent successfully:', emailSent);
    console.log('Session data after email:', JSON.stringify(req.session, null, 2));
    console.log('===================================');
    if (!emailSent) {
      return res.json({ message: "Failed to send verification email" });
    }
    // Store OTP and user data in session for later creation
    req.session.userOtp = otp;
    req.session.userData = { firstName, lastName, email, phone, password };
    // Return JSON with redirect URL for client-side navigation
    return res.json({ success: true, redirect: "/verify-otp" });
  } catch (error) {
    console.error("signup error", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// Resend OTP handler
const resendOtp = async (req, res) => {
  try {
    const result = await resendOtpService(req.session);
    
    if (!result.success) {
      return res.status(result.status || 500).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error in resendOtp controller:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request.'
    });
  }
};

module.exports = {
  loadHomepage,
  pageNotFound,
  loadSignup,
  signup,
  loadVerifyOtp,
  verifyOtp,
  resendOtp
};
