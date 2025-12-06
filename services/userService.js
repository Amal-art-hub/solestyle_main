const User = require("../models/user.js");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const getHomepageDate = () => {
  return {
    pageTitle: "Home Page",
  };
};

//generate otp
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send Email (use mailer utility if needed)
async function sendVerificationEmail(email, otp) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Verify your account",
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP: ${otp}</b>`,
    });

    return info.accepted.length > 0;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

//checking user is existed already
async function checkExistingUser(email) {
  return await User.findOne({ email });
}

// Create a new user and save to DB
async function createUser({ firstName, lastName, email, phone, password }) {
  const name = `${firstName} ${lastName}`;
  const newUser = new User({
    name,
    email,
    phone,
    password,
  });
  return await newUser.save();
}

// Verify OTP and create user
async function verifyOtpService(session, otp) {
  try {
    if (!session.userOtp) {
      return { 
        success: false, 
        status: 400,
        message: "Session expired. Please signup again." 
      };
    }

    if (otp !== session.userOtp) {
      return { 
        success: false, 
        status: 400,
        message: "Invalid OTP. Please try again." 
      };
    }

    // OTP is correct – create user
    const { firstName, lastName, email, phone, password } = session.userData;
    await createUser({ firstName, lastName, email, phone, password });
    
    // Clean up session
    session.userOtp = null;
    session.userData = null;
    
    return { 
      success: true, 
      redirectUrl: "/login" 
    };
  } catch (error) {
    console.error('Error in verifyOtpService:', error);
    return { 
      success: false, 
      status: 500,
      message: "Server error during verification" 
    };
  }
}

// Resend OTP service
async function resendOtpService(session) {
  if (!session.userData || !session.userData.email) {
    return { 
      success: false, 
      status: 400,
      message: "Session expired. Please sign up again." 
    };
  }

  const { email } = session.userData;
  const otp = generateOtp();
  
  // Log for debugging
  console.log('========== RESEND OTP SERVICE ==========');
  console.log('Resending OTP to:', email);
  console.log('New OTP:', otp);
  
  // Send the new OTP via email
  const emailSent = await sendVerificationEmail(email, otp);
  
  if (!emailSent) {
    console.error('Failed to send OTP email to:', email);
    return { 
      success: false, 
      status: 500,
      message: "Failed to send verification email. Please try again." 
    };
  }
  
  // Update the OTP in the session
  session.userOtp = otp;
  
  console.log('OTP resent successfully to:', email);
  console.log('======================================');
  
  return { 
    success: true,
    message: "A new OTP has been sent to your email." 
  };
}

// Login user with email and password
async function loginUser(email, password) {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    // If user is an admin, redirect to admin login
    if (user?.isAdmin === 1) {
      throw new Error("Please use admin login");
    }
    
    // Check if user exists
    if (!user) {
      throw new Error("Invalid email or password");
    }
    
    // Check if user is blocked
    if (user.isBlocked) {
      throw new Error("Your account has been blocked. Please contact support.");
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }
    
    // Return user data without password
    const { password: _, ...userData } = user.toObject();
    return {
      success: true,
      user: userData
    };
    
  } catch (error) {
    console.error('Login service error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during login.'
    };
  }
}

module.exports = {
  getHomepageDate,
  checkExistingUser,
  generateOtp,
  sendVerificationEmail,
  createUser,
  resendOtpService,
  verifyOtpService,
  loginUser
};
