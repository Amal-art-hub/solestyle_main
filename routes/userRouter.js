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
const wishlistController = require("../controllers/user/wishlistController");

console.log(cartController);

const { checkUserStatus,
    isAuth
} = require("../middlewares/user-mid/user-auth");
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
});

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
router.get("/user/profile", isAuth, checkUserStatus, profileController.loadProfile);


//--------------------------------------------submitting the edit profile

router.post("/user/profile/edit", isAuth, checkUserStatus, profileController.updateProfile);


//---------------------------------------------------updating password
router.post("/user/profile/password", isAuth, checkUserStatus, profileController.updatePassword);
//-----------------------------------email changing
router.get("/user/profile/email", isAuth, checkUserStatus, profileController.loadChangeEmail);
//-------------------------------------sending email
router.post("/user/profile/email", isAuth, checkUserStatus, profileController.requestEmailOtp);
//------------------------------submiting otp for verify
router.post("/user/verify-email-otp", isAuth, checkUserStatus, profileController.verifyEmailOtp);



//----------------------------------------------------------------------------------------address list
router.get("/user/addresses", isAuth, checkUserStatus, profileController.loadAddressPage);

router.post("/user/profile/addresses/add", isAuth, checkUserStatus, profileController.addAddress);

router.put("/user/profile/addresses/edit/:id", isAuth, checkUserStatus, profileController.editAddress);

router.delete("/user/profile/addresses/delete/:id", isAuth, checkUserStatus, profileController.deleteAddress);



//-----------------------------------------------------------------------------------------cart list
router.get("/user/cart", isAuth, checkUserStatus, cartController.loadCartPage);


router.post("/cart/add", isAuth, checkUserStatus, cartController.addToCart);

router.patch("/cart/update", isAuth, checkUserStatus, cartController.updateCartQty);

router.delete("/cart/remove/:itemId", isAuth, checkUserStatus, cartController.removeCartItem);



//=======================================================================================checkout

router.get("/checkout", isAuth, checkUserStatus, checkoutController.loadCheckout);

router.post("/checkout/place-order", isAuth, checkUserStatus, checkoutController.placeOrder);

router.get("/order-success/:id", isAuth, checkUserStatus, checkoutController.orderSuccess);
//------------------------------------------------------------------------------------coupen apply
router.post("/checkout/apply-coupon", isAuth, checkUserStatus, checkoutController.applyCoupen);
router.post("/checkout/remove-coupon", isAuth, checkUserStatus, checkoutController.removeCoupon);
//----------------------------------------------------------------------------------------razorpay
router.post("/checkout/razorpay-order", isAuth, checkUserStatus, checkoutController.createRazorpayOrder);
router.get("/checkout/payment-failure", isAuth, checkUserStatus, checkoutController.paymentFailed);

router.post("/checkout/webhook", checkoutController.verifyRazorpayWebhook);

router.post("/retry-payment", isAuth, checkUserStatus, checkoutController.retryPayment);


//==========================================================================================orders

router.get("/user/orders", isAuth, checkUserStatus, ordersController.listOrder);
router.get("/orders/:id", isAuth, checkUserStatus, orderDetailController.getOrderDetails);


//---------------------------------------------------------------------------------------------------canceling
router.put("/user/orders/cancel-item/:orderId/:itemId", isAuth, checkUserStatus, orderDetailController.cancelOrderItem);
router.put("/user/orders/cancel/:orderId", isAuth, checkUserStatus, orderDetailController.cancelOrder);



//--------------------------------------------------------------------------------------------returning
router.put("/user/orders/return-item/:orderId/:itemId", isAuth, checkUserStatus, orderDetailController.returnOrderItem);

router.put("/user/orders/return/:orderId", isAuth, checkUserStatus, orderDetailController.returnOrder);

//-----------------------------------------------------------------------------------------invoice
router.get("/user/orders/invoice/:orderId", isAuth, checkUserStatus, orderDetailController.downloadInvoice);




//-----------------------------------------------------------------------------------------wallet

router.get("/user/wallet", isAuth, checkUserStatus, walletController.loadWalletPage);


//wishlist
router.get("/user/wishlist", isAuth, checkUserStatus, wishlistController.loadWishlist);
router.post("/user/wishlist/add", isAuth, checkUserStatus, wishlistController.addToWishlist);
router.delete("/user/wishlist/remove/:id", isAuth, checkUserStatus, wishlistController.removeFromWishlist);






// router.delete("/user/cart/clear", isAuth, checkUserStatus, cartController.removeAllItem)













module.exports = router;