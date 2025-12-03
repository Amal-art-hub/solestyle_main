const User = require("../models/user.js");
const nodemailer = require("nodemailer");

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

module.exports = {
  getHomepageDate,
  checkExistingUser,
  generateOtp,
  sendVerificationEmail,
  createUser,
};
