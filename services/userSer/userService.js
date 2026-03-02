import User from "../../models/user.js";
import Coupon from "../../models/Coupen.js";
import Offers from "../../models/offers.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import statusCode from "../../utils/statusCodes.js";

export const getHomepageDate = () => {
  return {
    pageTitle: "Home Page",
  };
};

//generate otp
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send Email
export async function sendVerificationEmail(email, otp) {
  console.log(`[DEVELOPMENT] OTP for ${email}: ${otp}`);
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
export async function checkExistingUser(email, phone) {
  return await User.findOne({ $or: [{ email: email }, { phone: phone }] });
}

// Create a new user with Referral Logic
// Full corrected createUser function in userService.js
export async function createUser({ firstName, lastName, email, phone, password, referralCode }) {
  console.log("---------- REFERRAL DEBUG ----------");
  console.log("1. Incoming Signup Data - Name:", firstName, "| Ref Code:", referralCode);

  const name = `${firstName} ${lastName}`;

  // Generate a unique code for the new user
  const myReferralCode = firstName.toUpperCase() + Math.floor(1000 + Math.random() * 9000);

  let referredByUserId = null;

  // Check if a referral code was actually provided
  if (referralCode && referralCode.trim() !== "") {
    const cleanRefCode = referralCode.trim().toUpperCase();
    console.log("2. Searching for Referrer with code:", cleanRefCode);

    const referrer = await User.findOne({ referralCode: cleanRefCode });

    if (referrer) {
      console.log("3. ✅ SUCCESS: Referrer found:", referrer.name);
      referredByUserId = referrer._id;

      // Fetch the active referral offer from database
      const today = new Date();
      const activeReferralOffer = await Offers.findOne({
        type: "referral",
        status: "active",
        start_date: { $lte: today },
        end_date: { $gte: today }
      });

      // Use dynamic discount if offer exists, otherwise default to 10%
      const discountVal = activeReferralOffer ? activeReferralOffer.discount_percentage : 10;
      const offerName = activeReferralOffer ? activeReferralOffer.name : "Referral Reward";

      // Create the reward coupon for the REFERRER
      const rewardCoupon = new Coupon({
        code: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        description: `Reward for referring ${firstName}`,
        discount_type: "Percentage",
        discount_value: discountVal,
        mincart_value: 500,
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
        userId: referrer._id, // Assign to the person who invited
        status: "active"
      });

      await rewardCoupon.save();
      console.log("4. ✅ SUCCESS: Reward Coupon saved for Referrer!");
    } else {
      console.log("3. ❌ FAILURE: Referrer code not found in database.");
    }
  } else {
    console.log("2. ⚠️ INFO: No referral code was entered.");
  }

  const newUser = new User({
    name,
    email,
    phone,
    password,
    referralCode: myReferralCode,
    referredBy: referredByUserId
  });

  console.log("5. Saving new user to database...");
  const savedUser = await newUser.save();
  console.log("---------- DEBUG COMPLETE ----------");

  return savedUser;
}

// Verify OTP and create user
export async function verifyOtpService(session, otp) {
  try {
    if (!session.userOtp) {
      return {
        success: false,
        status: statusCode.BAD_REQUEST,
        message: "Session expired. Please signup again."
      };
    }

    if (Date.now() > session.otpExpiry) {
      return { success: false, status: statusCode.BAD_REQUEST, message: "OTP has expired. Please resend." };
    }

    if (otp !== session.userOtp) {
      return {
        success: false,
        status: statusCode.BAD_REQUEST,
        message: "Invalid OTP. Please try again."
      };
    }

    // OTP is correct – create user
    const { firstName, lastName, email, phone, password, referralCode } = session.userData;

    await createUser({ firstName, lastName, email, phone, password, referralCode });

    // Clean up session
    session.userOtp = null;
    session.userData = null;

    return {
      success: true,
      redirectUrl: "/login"
    };
  } catch (error) {
    console.error("Error in verifyOtpService:", error);
    return {
      success: false,
      status: statusCode.INTERNAL_SERVER_ERROR,
      message: "Server error during verification"
    };
  }
}

// Resend OTP service
export async function resendOtpService(session) {
  if (!session.userData || !session.userData.email) {
    return {
      success: false,
      status: statusCode.BAD_REQUEST,
      message: "Session expired. Please sign up again."
    };
  }

  const { email } = session.userData;
  const otp = generateOtp();

  console.log("========== RESEND OTP SERVICE ==========");
  console.log("Resending OTP to:", email);
  console.log("New OTP:", otp);

  const emailSent = await sendVerificationEmail(email, otp);

  if (!emailSent) {
    console.error("Failed to send OTP email to:", email);
    return {
      success: false,
      status: statusCode.INTERNAL_SERVER_ERROR,
      message: "Failed to send verification email. Please try again."
    };
  }

  session.userOtp = otp;
  session.otpExpiry = Date.now() + 5 * 60 * 1000;

  console.log("OTP resent successfully to:", email);
  console.log("======================================");

  return {
    success: true,
    message: "A new OTP has been sent to your email."
  };
}

// Login user with email and password
export async function loginUser(email, password) {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });

    if (user?.isAdmin === 1) {
      throw new Error("Please use admin login");
    }

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.isBlock) {
      throw new Error("Your account has been blocked. Please contact support.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Invalid email or password");
    }

    const { password: _, ...userData } = user.toObject();
    return {
      success: true,
      user: userData
    };

  } catch (error) {
    console.error("Login service error:", error);
    return {
      success: false,
      message: error.message || "An error occurred during login."
    };
  }
}

export const resentfortgotService = async (session) => {
  try {
    const email = session.resetEmail;
    if (!email) {
      return {
        success: false,
        status: statusCode.BAD_REQUEST,
        message: "Session expired,please start again."
      };
    }

    const newOtp = generateOtp();

    session.resetOtp = newOtp;
    session.resetOtpExpiry = Date.now() + 3 * 60 * 1000;

    console.log("Resent password otp for:", email);
    console.log("New otp is:", newOtp);

    const emailSent = await sendVerificationEmail(email, newOtp);

    if (!emailSent) {
      console.error("Failed to send reset password OTP email");
      return {
        success: false,
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: "failed to send email.please try again"
      };
    }

    return {
      success: true,
      message: "New OTP has been sent to your email"
    };

  } catch (error) {
    console.error("Error in resentfortgotService:", error);
    return {
      success: false,
      status: statusCode.INTERNAL_SERVER_ERROR,
      message: "Server error"
    };
  }
};

export const verifyResetOtpService = async (session, otp) => {
  try {
    const storedOtp = session.resetOtp;
    const email = session.resetEmail;
    const expiry = session.resetOtpExpiry;


    if (Date.now() > expiry) {
      return { success: false, status: statusCode.BAD_REQUEST, message: "OTP has expired." };
    }

    if (!storedOtp || !email) {
      return {
        success: true,
        status: statusCode.INTERNAL_SERVER_ERROR,
        message: "Otp not found.Please request a new one",
      };
    }

    if (storedOtp !== otp) {
      return {
        success: false,
        status: statusCode.BAD_REQUEST,
        message: "Invalid OTP.Please try again"
      };
    }

    session.otpVerified = true;
    return {
      success: true,
      message: "otp verified successfully"
    };
  } catch (error) {
    console.error("Error in verifyResetOtpService:", error);
    return {
      success: false,
      status: statusCode.INTERNAL_SERVER_ERROR,
      message: "Server error"
    };
  }
};

export const checkPassword = async (session, newPassword) => {
  try {
    const email = session.resetEmail;
    const otpVerified = session.otpVerified;

    if (!otpVerified || !email) {
      return {
        success: false,
        status: statusCode.FORBIDDEN,
        message: "Unauthorized. Please verify OTP first"
      };
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return {
        success: false,
        status: statusCode.BAD_REQUEST,
        message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate({ email: email }, { password: hashedPassword });

    session.resetOtp = null;
    session.resetEmail = null;
    session.resetOtpExpiry = null;
    session.otpVerified = null;
    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (error) {
    console.error("Error in updateUserPasswordService:", error);
    return {
      success: false,
      status: statusCode.INTERNAL_SERVER_ERROR,
      message: "Server error",
    };
  }
};
