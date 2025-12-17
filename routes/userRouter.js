const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/user/userController");
const productController = require("../controllers/user/productUserController");

const { checkUserStatus } = require("../middlewares/user-mid/user-auth");
const { loadCategories } = require("../middlewares/user-mid/categoryMiddleware");
router.use(loadCategories);



router.get("/pageNotFound", userController.pageNotFound);
router.get("/", userController.loadHomepage);
router.get("/signup", userController.loadSignup);
router.post("/signup", userController.signup);
router.get("/verify-otp", userController.loadVerifyOtp);
router.post("/verify-otp", userController.verifyOtp);
router.post("/resend-otp", userController.resendOtp);
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/signup" }), (req, res) => {
      req.session.user = req.user; 
        // save session ensuring it persists before redirect
        req.session.save((err) => {
            if(err){
                console.log("Session save error", err);
                return res.redirect("/login");
            }
            res.redirect("/");
        });
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



//mens products showing area

router.get("/mens-products", productController.getMensProducts);
router.get("/product/:id", productController.getProductDetails);

//Women products showing area
router.get("/womens-products",productController.getWomenProducts);

//kids products showing
router.get("/kids-products",productController.getKidsProducts);



module.exports = router;