import {
    getCheckoutData,
    placeOrderService,
    validateCoupon,
    createRazorpayOrderService,
    retryPaymentService
} from "../../services/userSer/checkoutService.js";
import {
    getWallet,
} from "../../services/userSer/walletService.js";
import statusCode from "../../utils/statusCodes.js";
import crypto from "crypto";
import Order from "../../models/orders.js";
import Payment from "../../models/payment.js";
import Cart from "../../models/cart.js";
import Coupon from "../../models/Coupen.js";

export const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { cart, addresses, subtotal, coupons } = await getCheckoutData(userId);
        const wallet = await getWallet(userId);
        if (!cart) {
            return res.redirect("/user/cart");
        }

        res.render("checkout", {
            user: req.session.user,
            cart: cart,
            addresses: addresses,
            subtotal: subtotal,
            discount: req.session.coupon ? req.session.coupon.discount : 0,
            coupon: req.session.coupon || null,
            coupons: coupons,
            wallet: wallet
        });
    } catch (error) {
        console.error("Load Checkout Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
    }
};

export const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { addressId, paymentMethod, paymentDetails } = req.body;
        const couponData = req.session.coupon;

        console.log("SERVER DEBUG: placeOrder called", { userId, paymentMethod, addressId });

        if (!addressId) {
            console.log("SERVER DEBUG: Missing addressId");
            return res.status(statusCode.BAD_REQUEST).json({ success: false, message: "Please select an address" });
        }

        const order = await placeOrderService(userId, addressId, paymentMethod, couponData, paymentDetails);

        console.log("SERVER DEBUG: Order placed successfully", order._id);
        req.session.coupon = null;

        res.status(statusCode.OK).json({
            success: true,
            message: "Order placed successfully",
            orderId: order._id
        });

    } catch (error) {
        console.error("SERVER DEBUG: Place Order Error:", error.message);
        res.status(statusCode.BAD_REQUEST).json({
            success: false,
            message: error.message || "Failed to place order"
        });
    }
};

export const orderSuccess = async (req, res) => {
    try {
        const orderId = req.params.id;
        res.render("orderSuccess", {
            user: req.session.user,
            orderId: orderId
        });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
    }
};

export const applyCoupen = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.session.user._id;
        console.log("error is :", code);

        const { subtotal } = await getCheckoutData(userId);
        console.log("DEBUG: Subtotal fetched", subtotal);

        const coupon = await validateCoupon(userId, code);
        console.log("DEBUG: Coupon validated", coupon);

        if (subtotal < coupon.mincart_value) {
            throw new Error(`Min purchase of ₹${coupon.min_purchase_amount || coupon.mincart_value} required`);
        }

        let discount = 0;
        if (coupon.discount_type === "Percentage") {
            discount = (subtotal * coupon.discount_value) / 100;
        } else {
            discount = coupon.discount_value;
        }

        if (discount > 2000) {
            discount = 2000;
        }

        req.session.coupon = {
            code: coupon.code,
            discount: discount,
            _id: coupon._id
        };

        res.status(statusCode.OK).json({ success: true, discount, newTotal: subtotal - discount });

    } catch (error) {
        console.error("DEBUG: Apply Coupon Error", error.message);
        res.status(statusCode.BAD_REQUEST).json({ success: false, message: error.message });
    }
};

export const removeCoupon = async (req, res) => {
    req.session.coupon = null;
    res.status(statusCode.OK).json({ success: true });
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const couponData = req.session.coupon;

        const { addressId } = req.body;

        const order = await createRazorpayOrderService(userId, addressId, couponData);
        res.status(statusCode.OK).json({
            success: true,
            order: order
        });
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Failed to create payment order"
        });
    }
};

export const paymentFailed = async (req, res) => {
    try {
        const message = req.query.message || "We couldn't process your payment. This might be due to a network issue or a declined transaction. Don't worry, you haven't been charged.";
        res.render("paymentFailure", {
            user: req.session.user,
            message: message
        });
    } catch (error) {
        console.error("Payment Failure Page Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
    }
};

// export const verifyRazorpayWebhook = async (req, res) => {

//     try {
//         const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

//         const shasum = crypto.createHmac("sha256", secret);
//         shasum.update(JSON.stringify(req.body));
//         const digest = shasum.digest("hex");
//         if (digest === req.headers["x-razorpay-signature"]) {
//             console.log("Webhook Verified! Payment Captured.");

//             const event = req.body;
//             if (event.event === "payment.captured") {

//                 const paymentDetails = event.payload.payment.entity;
//                 const razorpayOrderId = paymentDetails.order_id;

//                 const order = await Order.findOne({
//                     razorpay_order_id: razorpayOrderId,
//                 });
//                 if (order && order.status === "Payment Pending") {

//                     order.status = "pending";
//                     order.items.forEach(item => { item.status = "pending"; });

//                     const newPayment = new Payment({
//                         user_id: order.user_id,
//                         order_id: order._id,
//                         payment_method: "Razorpay",
//                         amount: order.final_total,
//                         status: "completed",
//                         transaction_id: paymentDetails.id
//                     });
//                     await newPayment.save();

//                     order.payment_id = newPayment._id;
//                     await order.save();

//                     await Cart.findOneAndDelete({ user_id: order.user_id });

//                     console.log(`SUCCESS: Order ${order.order_number} processed via Webhook`);
//                 } else {
//                     console.log("Order already processed or not found.");
//                 }
//             }
//         } else {
//             console.log("INVALID SIGNATURE: Webhook ignored.");
//         }

//         res.status(statusCode.OK).json({ status: "ok" });
//     } catch (error) {
//         console.error("Webhook Error:", error);
//         res.status(200).json({ status: "error" });
//     }
// };

export const verifyRazorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if (digest === req.headers["x-razorpay-signature"]) {
            console.log("Webhook Verified! Payment Captured.");

            const event = req.body;
            if (event.event === "payment.captured") {

                const paymentDetails = event.payload.payment.entity;
                const razorpayOrderId = paymentDetails.order_id;

                const order = await Order.findOne({
                    razorpay_order_id: razorpayOrderId,
                });

                if (order && order.status === "Payment Pending") {
                    // Update order status to successful
                    order.status = "pending";
                    order.items.forEach(item => { item.status = "pending"; });

                    const newPayment = new Payment({
                        user_id: order.user_id,
                        order_id: order._id,
                        payment_method: "Razorpay",
                        amount: order.final_total,
                        status: "completed",
                        transaction_id: paymentDetails.id
                    });
                    await newPayment.save();

                    order.payment_id = newPayment._id;
                    await order.save();

                    // ✅ FIXED: Mark coupon as used after payment is confirmed
                    if (order.coupon_id) {
                        await Coupon.findByIdAndUpdate(order.coupon_id, {
                            $addToSet: { used_by: order.user_id }
                        });
                        console.log(`SUCCESS: Coupon marked as used for order ${order.order_number}`);
                    }

                    // Clear the user's cart
                    await Cart.findOneAndDelete({ user_id: order.user_id });

                    console.log(`SUCCESS: Order ${order.order_number} processed via Webhook`);
                } else {
                    console.log("Order already processed or not found.");
                }
            }
        } else {
            console.log("INVALID SIGNATURE: Webhook ignored.");
        }

        res.status(statusCode.OK).json({ status: "ok" });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(200).json({ status: "error" });
    }
};





export const retryPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const razrpayOrder = await retryPaymentService(orderId);
        res.status(statusCode.OK).json({ success: true, order: razrpayOrder });

    } catch (error) {
        console.error("Retry Payment Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Failed to retry payment"
        });
    }
};