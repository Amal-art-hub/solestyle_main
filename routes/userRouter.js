const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/user/userController");
const { checkUserStatus } = require("../middlewares/user-mid/user-auth");



router.get("/pageNotFound", userController.pageNotFound);
router.get("/", userController.loadHomepage);
router.get("/signup", userController.loadSignup);
router.post("/signup", userController.signup);
router.get("/verify-otp", userController.loadVerifyOtp);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/signup" }), (req, res) => {
    res.redirect("/")
})

router.get("/login", userController.loadLogin);
router.post("/login", userController.login);

router.get("/forgot-password", userController.forgotEmail);
router.post("/forgot-password", userController.forgEmailSend);
router.get("/forg-verify-otp", userController.loadOtptype);
router.post("/resend-forgot-otp", userController.resendForgotOtp);
router.post("/forget-verify-otp", userController.verifyForgotOtp);
router.get("/reset-password", userController.loadrestPass);
router.post("/reset-password", userController.resetPassword);
router.get("/logout", userController.logout);

module.exports = router;