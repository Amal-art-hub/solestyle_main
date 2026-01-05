const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/user/userController");
const productController = require("../controllers/user/productUserController");
const profileController = require("../controllers/user/profileController");
const cartController = require("../controllers/user/cartController");
const checkoutController = require("../controllers/user/checkoutController");
const orderDetailController = require("../controllers/user/orderDetailController");
const ordersController = require("../controllers/user/ordersController");
const walletController = require("../controllers/user/walletController");

console.log(cartController);

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
        if (err) {
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
router.get("/mens-products", checkUserStatus, productController.getMensProducts);
router.get("/product/:id", checkUserStatus, productController.getProductDetails);

//Women products showing area
router.get("/womens-products", checkUserStatus, productController.getWomenProducts);

//kids products showing
router.get("/kids-products", checkUserStatus, productController.getKidsProducts);



//---------------------------------------------------------------------------------------------profile
//opening profile 
router.get("/user/profile", checkUserStatus, profileController.loadProfile);


//--------------------------------------------submitting the edit profile

router.post("/user/profile/edit", checkUserStatus, profileController.updateProfile);


//---------------------------------------------------updating password
router.post("/user/profile/password", checkUserStatus, profileController.updatePassword);
//-----------------------------------email changing
router.get("/user/profile/email", checkUserStatus, profileController.loadChangeEmail);
//-------------------------------------sending email
router.post("/user/profile/email", checkUserStatus, profileController.requestEmailOtp);
//------------------------------submiting otp for verify
router.post("/user/verify-email-otp", checkUserStatus, profileController.verifyEmailOtp);



//----------------------------------------------------------------------------------------address list
router.get("/user/addresses", checkUserStatus, profileController.loadAddressPage);

router.post("/user/profile/addresses/add", checkUserStatus, profileController.addAddress);

router.put("/user/profile/addresses/edit/:id", checkUserStatus, profileController.editAddress);

router.delete("/user/profile/addresses/delete/:id", checkUserStatus, profileController.deleteAddress);



//-----------------------------------------------------------------------------------------cart list
router.get("/user/cart", checkUserStatus, cartController.loadCartPage);


router.post("/cart/add", checkUserStatus, cartController.addToCart);

router.patch("/cart/update", checkUserStatus, cartController.updateCartQty);

router.delete("/cart/remove/:itemId", checkUserStatus, cartController.removeCartItem);



//=======================================================================================checkout

router.get("/checkout", checkUserStatus, checkoutController.loadCheckout);

router.post("/checkout/place-order", checkUserStatus, checkoutController.placeOrder);

router.get('/order-success/:id', checkUserStatus, checkoutController.orderSuccess);
//------------------------------------------------------------------------------------coupen apply
router.post("/checkout/apply-coupon",checkUserStatus,checkoutController.applyCoupen);
router.post("/checkout/remove-coupon", checkUserStatus, checkoutController.removeCoupon);


//==========================================================================================orders

router.get("/user/orders", checkUserStatus, ordersController.listOrder);
router.get("/orders/:id", orderDetailController.getOrderDetails);


//---------------------------------------------------------------------------------------------------canceling
router.put("/user/orders/cancel-item/:orderId/:itemId", checkUserStatus, orderDetailController.cancelOrderItem);
router.put("/user/orders/cancel/:orderId", checkUserStatus, orderDetailController.cancelOrder);



//--------------------------------------------------------------------------------------------returning
router.put("/user/orders/return-item/:orderId/:itemId",checkUserStatus,orderDetailController.returnOrderItem);

router.put("/user/orders/return/:orderId", checkUserStatus, orderDetailController.returnOrder);

//-----------------------------------------------------------------------------------------invoice
router.get("/user/orders/invoice/:orderId", checkUserStatus, orderDetailController.downloadInvoice);




//-----------------------------------------------------------------------------------------wallet

router.get("/user/wallet",checkUserStatus,walletController.loadWalletPage);

















module.exports = router;