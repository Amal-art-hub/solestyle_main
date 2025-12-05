const {
  getHomepageDate,
  sendVerificationEmail,
  generateOtp,
  checkExistingUser,
  createUser,
  resendOtpService,
  verifyOtpService
} = require("../../services/userService.js");
const User = require("../../models/user");
const bcrypt = require("bcrypt");
const env = require("dotenv").config();

const pageNotFound = (req, res) => {
  res.status(404).render("page-404");
};

// Load home page
const loadHomepage = async (req, res) => {
  try {
    const data = getHomepageDate();
    return res.render("home", {
      ...data,
      user: req.session.user || null   // ← send logged-in user to EJS
    });
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

const loadLogin=async(req,res)=>{
  try {
    if(!req.session.user){
      return res.render("login")
    }else{
      res.redirect("/")
    }
  } catch (error) {
   res.redirect("/pageNotFound")
  }
}

const login = async (req, res) => {
  try {
    console.log('Login attempt with data:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    console.log('Looking for user with email:', email);
    
    // Find user by email, regardless of isAdmin status
    let findUser = await User.findOne({ email: email });
    console.log('User found:', findUser);
    
    // If user exists but is an admin (isAdmin = 1), redirect to admin login
    if (findUser && findUser.isAdmin === 1) {
      console.log('Admin user found, but trying to log in as regular user');
      return res.status(403).json({
        success: false,
        message: "Please use admin login"
      });
    }
    
    // If user doesn't exist or is not an admin, we can proceed with login
    // (treat missing isAdmin as regular user)
    
    if (!findUser) {
      console.log('User not found with given criteria');
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }
    
    console.log('User found, checking if blocked');
    if (findUser.isBlocked) {
      console.log('User is blocked');
      return res.status(403).json({ 
        success: false, 
        message: "Your account has been blocked. Please contact support." 
      });
    }
    
    console.log('Comparing passwords...');
    const passwordMatch = await bcrypt.compare(password, findUser.password);

    if (!passwordMatch) {
      console.log('Password does not match');
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    console.log('Password matched, creating session');
    
    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ 
          success: false, 
          message: "Session error. Please try again." 
        });
      }
      
      // Store user info in session
      req.session.user = {
        _id: findUser._id,
        email: findUser.email,
        name: findUser.name
      };
      
      // Save the session
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ 
            success: false, 
            message: "Session error. Please try again." 
          });
        }
        
        console.log('Login successful, sending response');
        return res.status(200).json({ 
          success: true, 
          message: "Login successful",
          redirectUrl: "/"
        });
      });
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "An error occurred during login. Please try again." 
    });
  }
}






module.exports = {
  loadHomepage,
  pageNotFound,
  loadSignup,
  signup,
  loadVerifyOtp,
  verifyOtp,
  resendOtp,
  loadLogin,
  login
};
