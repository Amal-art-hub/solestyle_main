const {
  getHomepageDate,
  sendVerificationEmail,
  generateOtp,
  checkExistingUser,
  createUser
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
    if (!req.session.userOtp) {
      return res.render("verify-otp", { message: "Session expired. Please signup again." });
    }
    if (otp !== req.session.userOtp) {
      return res.render("verify-otp", { message: "Invalid OTP. Please try again." });
    }
    // OTP is correct – create user
    const { firstName, lastName, email, phone, password } = req.session.userData;
    await createUser({ firstName, lastName, email, phone, password });
    // Clean up session
    req.session.userOtp = null;
    req.session.userData = null;
    // Redirect to login or homepage after successful registration
    return res.redirect("/login");
  } catch (error) {
    console.error("OTP verification error", error);
    res.redirect("/pageNotFound");
  }
};

// Signup handler – generate OTP and redirect to verification page
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.render("signup", { message: "Password do not match" });
    }
    const existingUser = await checkExistingUser(email);
    if (existingUser) {
      return res.render("signup", { message: "User already exists" });
    }
    const otp = generateOtp();
    console.log("Generated OTP:", otp);
    const emailSent = await sendVerificationEmail(email, otp);
    console.log("Email sent result:", emailSent);
    if (!emailSent) {
      return res.json("email-error");
    }
    // Store OTP and user data in session for later creation
    req.session.userOtp = otp;
    req.session.userData = { firstName, lastName, email, phone, password };
    // Redirect to OTP verification page
    return res.redirect("/verify-otp");
  } catch (error) {
    console.error("signup error", error);
    res.redirect("/pageNotFound");
  }
};

module.exports = {
  loadHomepage,
  pageNotFound,
  loadSignup,
  signup,
  loadVerifyOtp,
  verifyOtp
};






















//submitting signup page  ,directly user data saving in the db

// const signup=async(req,res)=>{
//    const{firstName,lastName,email,phone,password,confirmPassword}=req.body;
//   try {

//     if(password!==confirmPassword){
//       return res.status(400).send("Password does not match");

//     }
//     const existingUser=await findUserByEmail(email);
//     if(existingUser){
//       return res.status(400).send("Email already registered");
//     }

//     const newUser=await createUser({
//       firstName,lastName,email,phone,password
//     });

//     console.log(newUser);

//     // return res.redirect("/login");
//         return res.status(200).json({
//       success: true,
//       message: "Registration successful! Redirecting to login...",
//       redirect: "/login"
//     });

//   } catch (error) {
//     // res.status(500).send("Internalserver error");
//     console.error("Signup error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred during registration. Please try again."
//     });
//   }
// }
