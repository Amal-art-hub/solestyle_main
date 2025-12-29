const {
  getHomepageDate,
  sendVerificationEmail,
  generateOtp,
  checkExistingUser,
  createUser,
  resendOtpService,
  verifyOtpService,
  loginUser,
  resentfortgotService,
  verifyResetOtpService,
  checkPassword
} = require("../../services/userSer/userService.js");

const { getTrendingProducts } = require("../../services/userSer/productUserServices");

const User = require("../../models/user");

const env = require("dotenv").config();

const statusCode = require("../../utils/statusCodes.js");

const pageNotFound = (req, res) => {
  res.status(statusCode.NOT_FOUND).render("page-404");
};

// Load home page
const loadHomepage = async (req, res) => {
  try {
    const data = getHomepageDate();
    const trendingData = await getTrendingProducts();
    return res.render("home", {
      ...data,
      trending: trendingData,
      user: req.session.user || null, // ← send logged-in user to EJS
    });
  } catch (error) {
    console.log("Home page not found");
    res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server error");
  }
};

// Load signup page
const loadSignup = async (req, res) => {
  try {
    return res.render("signup");
  } catch (error) {
    console.log("signup page error :", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server Error");
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
      return res.status(result.status || statusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: result.message,
      });
    }

    res.json({
      success: true,
      redirectUrl: result.redirectUrl,
    });
  } catch (error) {
    console.error("Error in verifyOtp controller:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred during OTP verification.",
    });
  }
};

// Signup handler – generate OTP and redirect to verification page
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } =
      req.body;
    if (password !== confirmPassword) {
      return res.json({ message: "Password do not match" });
    }
    const existingUser = await checkExistingUser(email);
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const otp = generateOtp();
    // Enhanced logging for OTP debugging
    console.log("========== OTP DEBUGGING ==========");
    console.log("Generated OTP:", otp);
    console.log("Email being sent to:", email);
    console.log("Session ID:", req.sessionID);
    console.log(
      "Session data before email:",
      JSON.stringify(req.session, null, 2)
    );

    const emailSent = await sendVerificationEmail(email, otp);
    console.log("Email sent successfully:", emailSent);
    console.log(
      "Session data after email:",
      JSON.stringify(req.session, null, 2)
    );
    console.log("===================================");
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
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error during signup" });
  }
};

//------------------------------------------------------------------------------------------- Resend OTP handler
const resendOtp = async (req, res) => {
  try {
    const result = await resendOtpService(req.session);

    if (!result.success) {
      return res.status(result.status || statusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: result.message,
      });
    }

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in resendOtp controller:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

const loadLogin = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.render("login");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

const login = async (req, res) => {
  try {
    console.log("Login attempt with data:", req.body);
    const { email, password } = req.body;

    // Call the login service
    const result = await loginUser(email, password);

    if (!result.success) {
      // Determine appropriate status code based on the error message
      const code = result.message.includes("blocked")
        ? statusCode.FORBIDDEN
        : result.message.includes("invalid")
          ? statusCode.UNAUTHORIZED
          : statusCode.BAD_REQUEST;

      return res.status(code).json({
        success: false,
        message: result.message,
      });
    }

    console.log("User authenticated, creating session");

    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Session error. Please try again.",
        });
      }

      // Store user info in session
      req.session.user = {
        _id: result.user._id,
        email: result.user.email,
        name: result.user.name,
      };

      // Save the session
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Session error. Please try again.",
          });
        }

        console.log("Login successful, sending response");
        return res.status(statusCode.OK).json({
          success: true,
          message: "Login successful",
          redirectUrl: "/",
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message:
        error.message || "An error occurred during login. Please try again.",
    });
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("Session error", err.message);
        return res.redirect("/pageNoteFound");
      }
      return res.redirect("/login");
    });
  } catch (error) {
    console.log("Logout error", error);
    res.redirect("/pageNotFound");
  }
};

const forgotEmail = (req, res) => {
  try {
    res.render("forgot-email");
  } catch (error) {
    console.error("forgot page rendering error", error);
    res.redirect("/pageNotFound");
  }
};

const forgEmailSend = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(statusCode.NOT_FOUND).json({
        success: false,
        message: "Email not registered",
      });
    }
    const otp = generateOtp();

    req.session.resetOtp = otp;
    req.session.resetEmail = email;
    req.session.resetOtpExpiry = Date.now() + 5 * 60 * 1000;

    console.log("Reset otp for ", email, ":", otp);
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    return res.status(statusCode.OK).json({
      success: true,
      message: "otp sent to your emai",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
    });
  }
};

const loadOtptype = (req, res) => {
  try {
    res.render("forg-verify-otp");
  } catch (error) {
    console.error("otp rendering failed :", error);
  }
};

const resendForgotOtp = async (req, res) => {
  try {
    const result = await resentfortgotService(req.session);

    if (!result.success) {
      return res.status(result.status || statusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: result.message,
      });
    }
    res.status(statusCode.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in resendForgotOtp controller:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
    });
  }
};

const verifyForgotOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const result = await verifyResetOtpService(req.session, otp);
    if (!result.success) {
      return res.status(result.status || statusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: result.message,
      });
    }
    return res.status(statusCode.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in verifyForgotOtp controller:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
    });
  }
};


const loadrestPass = (req, res) => {
  try {
    res.render("reset-password")
  } catch (error) {
    console.error("rendering reset password page failed:", error);
  }
}


const resetPassword = async (req, res) => {

  try {
    const { newPassword } = req.body;

    const result = await checkPassword(req.session, newPassword);

    if (!result.success) {
      return res.status(result.status || statusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: result.message

      });
    }

    res.status(statusCode.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("error in reset password:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "server error"
    })
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
  login,
  logout,
  forgotEmail,
  forgEmailSend,
  loadOtptype,
  resendForgotOtp,
  verifyForgotOtp,
  loadrestPass,
  resetPassword
};
