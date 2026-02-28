import {
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
} from "../../services/userSer/userService.js";

import { getTrendingProducts } from "../../services/userSer/productUserServices.js";
import Banner from "../../models/Banner.js";
import BrandSection from "../../models/BrandSection.js";
import User from "../../models/user.js";
import 'dotenv/config';
import statusCode from "../../utils/statusCodes.js";

export const pageNotFound = (req, res) => {
  res.status(statusCode.NOT_FOUND).render("page-404");
};

// Load home page
export const loadHomepage = async (req, res) => {
  try {
    const data = getHomepageDate();

    // Parallelize all database calls
    const [trendingData, banners, brandSection] = await Promise.all([
      getTrendingProducts(),
      Banner.find({ status: 'active' }).sort({ order: 1 }),
      BrandSection.findOne()
    ]);

    return res.render("home", {
      ...data,
      trending: trendingData,
      banners: banners,
      brandSection: brandSection || {},
      user: req.session.user || null,
    });
  } catch (error) {
    console.log("Home page error:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server error");
  }
};

// Load signup page
export const loadSignup = async (req, res) => {
  try {
    const referralCode = req.query.ref || "";
    return res.render("signup", { referralCode });
  } catch (error) {
    console.log("signup page error :", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

// Load OTP verification page
export const loadVerifyOtp = (req, res) => {
  return res.render("verify-otp");
};

// Verify OTP and create user
export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const result = await verifyOtpService(req.session, otp);

    if (!result.success) {
      return res.status(result.status || statusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: result.message,
      });
    }

    res.status(statusCode.OK).json({
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


export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword, referralCode } =
      req.body;


    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const nameRegex = /^[A-Zaa-z\s]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      return res.status(400).json({ message: "Names should only contain letters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long and contain both letters and numbers" });
    }



    if (password !== confirmPassword) {
      return res.status(statusCode.BAD_REQUEST).json({ message: "Password do not match" });
    }
    const existingUser = await checkExistingUser(email, phone);
    if (existingUser) {
      const message = (existingUser.email.toLowerCase() === email.toLowerCase()) ? "Email already exists" : "Phone number already in use";
      return res.status(statusCode.CONFLICT).json({ message });
    }
    const otp = generateOtp();
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
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to send verification email" });
    }

    req.session.userOtp = otp;
    req.session.userData = { firstName, lastName, email, phone, password, referralCode };
    req.session.otpExpiry = Date.now() + 5 * 60 * 1000;

    return res.status(statusCode.OK).json({ success: true, redirect: "/verify-otp" });
  } catch (error) {
    console.error("signup error", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error during signup" });
  }
};

//------------------------------------------------------------------------------------------- Resend OTP handler
export const resendOtp = async (req, res) => {
  try {
    const result = await resendOtpService(req.session);

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
    console.error("Error in resendOtp controller:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "An error occurred while processing your request.",
    });
  }
};

export const loadLogin = async (req, res) => {
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

export const login = async (req, res) => {
  try {
    console.log("Login attempt with data:", req.body);
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    console.log("login responces:", result);

    if (!result.success) {
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

    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration error:", err);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: "Session error. Please try again.",
        });
      }

      req.session.user = {
        _id: result.user._id,
        email: result.user.email,
        name: result.user.name,
      };

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

export const logout = async (req, res) => {
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

export const forgotEmail = (req, res) => {
  try {
    res.render("forgot-email");
  } catch (error) {
    console.error("forgot page rendering error", error);
    res.redirect("/pageNotFound");
  }
};

export const forgEmailSend = async (req, res) => {
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

export const loadOtptype = (req, res) => {
  try {
    res.render("forg-verify-otp");
  } catch (error) {
    console.error("otp rendering failed :", error);
  }
};

export const resendForgotOtp = async (req, res) => {
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

export const verifyForgotOtp = async (req, res) => {
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

export const loadrestPass = (req, res) => {
  try {
    res.render("reset-password");
  } catch (error) {
    console.error("rendering reset password page failed:", error);
  }
};

export const resetPassword = async (req, res) => {
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
    });
  }
};
