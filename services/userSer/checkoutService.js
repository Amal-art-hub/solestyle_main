const Cart = require("../../models/cart");
const Address = require("../../models/address");
const Order = require("../../models/orders");
const Variant = require("../../models/varient");
const Product = require("../../models/product");
const Coupon = require("../../models/Coupen");
const Payment = require("../../models/payment");
const Razorpay = require("razorpay");
const { calculateFinalPrice } = require("./productUserServices");


const {

    debitWallet
} = require("../../services/userSer/walletService");


const getCheckoutData = async (userId) => {
    try {
        let cart = await Cart.findOne({ user_id: userId }).populate({
            path: "items.variant_id",
            select: "price stock size color images"
        }).populate({
            path: "items.product_id",
            select: "name categoryId isListed isDeleted"
        });

    

        const coupons = await Coupon.find({
            expiry_date: { $gte: new Date() },
            used_by: { $ne: userId }
        });



        if (!cart) {
            return { cart: null, addresses: [], subtotal: 0, coupons: [] };
        }






        cart = cart.toObject();
        cart.items = cart.items.filter(item => {
            const hasVariant = !!item.variant_id;
            const hasStock = hasVariant && item.variant_id.stock >= item.quantity;
            const isProductActive = item.product_id &&
                !item.product_id.isDeleted &&
                item.product_id.isListed;
            return hasVariant && hasStock && isProductActive;
        });






        if (cart.items.length === 0) {
            return { cart: null, addresses: [], subtotal: 0, coupons: coupons };
        }

        const addresses = await Address.find({ user_id: userId });

        let subtotal = 0;
        for (const item of cart.items) {

            const originalMRP = item.variant_id ? item.variant_id.price : 0;

            const { finalPrice } = await calculateFinalPrice(item.product_id, originalMRP);

            item.finalPrice = finalPrice;
            subtotal += item.quantity * finalPrice;
        }

        return { cart, addresses, subtotal, coupons };
    } catch (error) {
        console.error("Error in getCheckoutData service:", error);
        throw error;
    }
};

const placeOrderService = async (userId, addressId, paymentMethod, couponData, paymentDetails) => {
    // ============================================================
    // CASE 1: ONLINE PAYMENT (Update the Existing Pending Order)
    // ============================================================
    if (paymentMethod === "Online") {
        const { razorpay_order_id, razorpay_payment_id } = paymentDetails;

        // 1. Find the "Payment Pending" order we created earlier
        const pendingOrder = await Order.findOne({
            razorpay_order_id: razorpay_order_id
        }).populate("items.variant_id");

        if (!pendingOrder) throw new Error("Order not found or expired");

        // 2. Update Status to PLACED
        pendingOrder.status = "pending"; // Or "processing" - this means "Success"
        pendingOrder.items.forEach(item => { item.status = "pending"; });

        // 3. Create Payment Record
        const paymentDoc = new Payment({
            user_id: userId,
            order_id: pendingOrder._id,
            payment_method: "Razorpay",
            amount: pendingOrder.final_total,
            status: "completed",
            transaction_id: razorpay_payment_id
        });
        await paymentDoc.save();

        pendingOrder.payment_id = paymentDoc._id;
        await pendingOrder.save();

        // 4. Update Coupon Usage
        if (pendingOrder.coupon_id) {
            await Coupon.findByIdAndUpdate(pendingOrder.coupon_id, {
                $addToSet: { used_by: userId }
            });
        }

        // 5. Reduce Stock (Since we didn't do it in the first step)
        for (const item of pendingOrder.items) {
            // Check if variant exists to avoid crash
            if (item.variant_id) {
               const updatedVariant = await Variant.findOneAndUpdate(
    { _id: item.variant_id._id, stock: { $gte: item.quantity } }, 
    { $inc: { stock: -item.quantity } }
);
if (!updatedVariant) {
    throw new Error(`Sorry, ${item.name_snapshot} just went out of stock before payment completed!`);
}
            }
        }

        // 6. Clear Cart
        await Cart.findOneAndDelete({ user_id: userId });

        return pendingOrder;
    }

    // ============================================================
    // CASE 2: COD & WALLET (Create New Order - Old Logic)
    // ============================================================

    const cart = await Cart.findOne({ user_id: userId })
        .populate("items.variant_id")
        .populate("items.product_id");

    if (!cart || cart.items.length === 0) throw new Error("Cart is empty");


    const validItems = cart.items.filter(item => {
        return item.variant_id && item.variant_id.stock >= item.quantity && item.product_id && !item.product_id.isDeleted && item.product_id.isListed;
    });

    if (validItems.length === 0) {
        throw new Error("No available items to purchase");
    }


    const address = await Address.findById(addressId);
    if (!address) throw new Error("Address not found");

    let totalOfferPrice = 0;
    let totalMrpPrice = 0;
    const orderItems = [];

    for (const item of validItems) {
        const variant = item.variant_id;

        const originalMRP = variant.price;
        const { finalPrice } = await calculateFinalPrice(item.product_id, originalMRP);
        const itemOfferTotal = item.quantity * finalPrice;
        totalOfferPrice += itemOfferTotal;
        totalMrpPrice += item.quantity * originalMRP;


        orderItems.push({
            product_id: item.product_id,
            variant_id: item.variant_id._id,
            quantity: item.quantity,
            unit_price: finalPrice,
            original_price: originalMRP,
            total_amount: itemOfferTotal,
            name_snapshot: item.name_snapshot,
            variant_snapshot: `Size:${variant.size}, Color:${variant.color}`,
            status: "pending"
        });
    }

    let totalOfferSavings = totalMrpPrice - totalOfferPrice;

    let couponDiscount = couponData ? couponData.discount : 0;
    let finalPayable = totalOfferPrice - couponDiscount;
    if (finalPayable < 0) finalPayable = 0;

    if (paymentMethod === "COD" && finalPayable > 1000) {
        throw new Error("COD not available for orders above ₹1000");
    }

 
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `ORD-${datePart}-${randomPart}`;

    let orderStatus = "pending";
    if (paymentMethod === "Wallet") {
        await debitWallet(userId, finalPayable, "Order Payment - " + orderNumber);
        orderStatus = "processing";
    }

    const newOrder = new Order({
        user_id: userId,
        status: orderStatus,
        subtotal: totalMrpPrice,
        offer_discount: totalOfferSavings,
        discount_amount: couponDiscount,
        final_total: finalPayable,
        coupon_id: couponData ? couponData._id : null,
        order_number: orderNumber,
        address_id: addressId,
        shipping_address_snapshot: {
            name: address.name,
            address_line1: address.address_line1,
            address_line2: address.address_line2,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            phone: address.phone,
            alt_phone: address.alt_phone
        },
        payment_method: paymentMethod,
        items: orderItems,
        payment_id: null
    });

    await newOrder.save();

    if (couponData && couponData._id) {
        await Coupon.findByIdAndUpdate(couponData._id, {
            $addToSet: { used_by: userId }
        });
    }

    for (const item of validItems) {
        const updatedVariant = await Variant.findOneAndUpdate(
    { _id: item.variant_id._id, stock: { $gte: item.quantity } }, 
    { $inc: { stock: -item.quantity } }
);

if (!updatedVariant) {
    throw new Error(`Stock for ${item.name_snapshot} was just purchased by another user!`);
}
    }

    await Cart.findOneAndDelete({ user_id: userId });

    return newOrder;
};





const validateCoupon = async (userId, code) => {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });




    if (!coupon) throw new Error("Invalid Coupon Code");


    if (new Date() > new Date(coupon.expiry_date)) throw new Error("Coupon Expired");


    if (coupon.used_by.some(id => id.toString() === userId.toString())) {
        throw new Error("You have already used this coupon");
    }



    return coupon;
};



const createRazorpayOrderService = async (userId, addressId, couponData) => {
    const cart = await Cart.findOne({ user_id: userId }).populate("items.variant_id").populate("items.product_id");
    if (!cart || cart.items.length === 0) throw new Error("Cart is empty");


    const validItems = cart.items.filter(item => {
        return item.variant_id &&
            item.variant_id.stock >= item.quantity &&
            item.product_id &&
            !item.product_id.isDeleted &&
            item.product_id.isListed;
    });
    if (validItems.length === 0) throw new Error("No available items in cart");



    const address = await Address.findById(addressId);
    if (!address) throw new Error("Address not found");

    let totalOfferPrice = 0;
    let totalMrpPrice = 0;
    const orderItems = [];



    for (const item of validItems) {
        const originalMRP = item.variant_id.price;
        const { finalPrice } = await calculateFinalPrice(item.product_id, originalMRP);
        totalOfferPrice += item.quantity * finalPrice;
        totalMrpPrice += item.quantity * originalMRP;

        orderItems.push({
            product_id: item.product_id,
            variant_id: item.variant_id._id,
            quantity: item.quantity,
            unit_price: finalPrice,
            original_price: originalMRP,

            total_amount: item.quantity * finalPrice,
            name_snapshot: item.name_snapshot,
            status: "Payment Pending"
        });
    }

    let totalOfferSaving = totalMrpPrice - totalOfferPrice;

    let couponDiscount = couponData ? couponData.discount : 0;
    let finalPayable = totalOfferPrice - couponDiscount;

    // 3. Create RAZORPAY ID
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: Math.round(finalPayable * 100),
        currency: "INR",
        receipt: "order_rcptid_" + Date.now()
    };
    const rzpOrder = await instance.orders.create(options);

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    // Update inside the new Order({...}) object:
    const order_number = `ORD-${datePart}-${randomPart}`;


    const newOrder = new Order({
        user_id: userId,
        status: "Payment Pending",
        subtotal: totalMrpPrice,
        offer_discount: totalOfferSaving,
        discount_amount: couponDiscount,
        final_total: finalPayable,
        order_number: order_number,
        address_id: addressId,
        shipping_address_snapshot: { ...address.toObject() },
        payment_method: "Online",
        items: orderItems,

        razorpay_order_id: rzpOrder.id
    });

    console.log("finalPayable:", finalPayable);

    await newOrder.save();

    return rzpOrder; 
};



const retryPaymentService = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
        amount: Math.round(order.final_total * 100),
        currency: "INR", receipt: "retry_rcptid_" + Date.now()
    };

    const rzpOrder = await instance.orders.create(options);

    order.razorpay_order_id = rzpOrder.id;
    order.status = "Payment Pending";

    await order.save();

    return { ...rzpOrder, address_id: order.address_id };
};



module.exports = {
    getCheckoutData,
    placeOrderService,
    validateCoupon,
    createRazorpayOrderService,
    retryPaymentService
};