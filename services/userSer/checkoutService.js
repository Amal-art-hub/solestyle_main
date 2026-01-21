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
            select: "name categoryId" 
        }); 


        const coupons = await Coupon.find({expiry_date:{$gte: new Date()},
    used_by:{$ne:userId}}); 

        console.log("------------------------");
        console.log("DEBUG: Running getCheckoutData");
        console.log("FOUND COUPONS COUNT:", coupons.length);
        console.log("FIRST COUPON:", coupons[0]);
        console.log("------------------------");

        if (!cart || cart.items.length === 0) {
            return { cart: null, addresses: [], subtotal: 0 };
        }

        const addresses = await Address.find({ user_id: userId });

        cart = cart.toObject(); 
        let subtotal = 0;

        for (const item of cart.items) {
            if (item.product_id && item.variant_id) {
              
                const { finalPrice } = await calculateFinalPrice(item.product_id, item.variant_id.price);

               
                item.finalPrice = finalPrice;
            
                subtotal += item.quantity * finalPrice;
            }
        }
       

        return { cart, addresses, subtotal, coupons };
    } catch (error) {
        throw error;
    }
};

const placeOrderService = async (userId, addressId, paymentMethod, couponData, paymentDetails) => {
    try {
        // ============================================================
        // CASE 1: ONLINE PAYMENT (Update the Existing Pending Order)
        // ============================================================
        if (paymentMethod === 'Online') {
            const { razorpay_order_id, razorpay_payment_id } = paymentDetails;
            
            // 1. Find the "Payment Pending" order we created earlier
            const pendingOrder = await Order.findOne({ 
                razorpay_order_id: razorpay_order_id 
            }).populate('items.variant_id');

            if (!pendingOrder) throw new Error("Order not found or expired");

            // 2. Update Status to PLACED
            pendingOrder.status = "pending"; // Or "processing" - this means "Success"
            pendingOrder.items.forEach(item => { item.status = 'pending'; });
            
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
                 if(item.variant_id){
                    await Variant.findByIdAndUpdate(item.variant_id._id, {
                        $inc: { stock: -item.quantity }
                    });
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

        const address = await Address.findById(addressId);
        if (!address) throw new Error("Address not found");

           let totalOfferPrice = 0; 
        let totalMrpPrice = 0; 
        const orderItems = [];

        // Build Items & Check Stock
        for (const item of cart.items) {
            const variant = item.variant_id;
            if (variant.stock < item.quantity) {
                throw new Error(`Stock insufficient for ${item.name_snapshot}`);
            }
            
            const originalMRP = variant.price;
            const { finalPrice } = await calculateFinalPrice(item.product_id, originalMRP); 
            const itemOfferTotal=item.quantity*finalPrice;
            totalOfferPrice +=itemOfferTotal;
            totalMrpPrice +=item.quantity * originalMRP;
          



            
            orderItems.push({
                product_id: item.product_id,
                variant_id: item.variant_id._id,
                quantity: item.quantity,
                unit_price: finalPrice,
                original_price:originalMRP,
                total_amount: itemOfferTotal,
                name_snapshot: item.name_snapshot,
                variant_snapshot: `Size:${variant.size}, Color:${variant.color}`,
                status: 'pending'
            });
        }

        let totalOfferSavings=totalMrpPrice-totalOfferPrice;

        let couponDiscount  = couponData ? couponData.discount : 0;
        let finalPayable  = totalOfferPrice  - couponDiscount;
        if(finalPayable < 0) finalPayable = 0;

        const orderNumber = "ORD-" + Date.now() + Math.floor(Math.random() * 1000);

        let orderStatus = "pending";
        if (paymentMethod === 'Wallet') {
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

        for (const item of cart.items) {
            await Variant.findByIdAndUpdate(item.variant_id._id, {
                $inc: { stock: -item.quantity }
            });
        }

        await Cart.findOneAndDelete({ user_id: userId });

        return newOrder;

    } catch (error) {
        throw error;
    }
}





const validateCoupon = async (userId, code) => {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });


    if (!coupon) throw new Error("Invalid Coupon Code");


    if (new Date() > new Date(coupon.expiry_date)) throw new Error("Coupon Expired");


    if (coupon.used_by.includes(userId)) throw new Error("You have already used this coupon");


    return coupon;
};

// const createRazorpayOrderService = async (userId, couponData) => {
//     try {

//         const { subtotal } = await getCheckoutData(userId);
//         let totalAmount = subtotal;
//         if (couponData) {
//             totalAmount = subtotal - couponData.discount;
//         }


//         console.log("---------------- DEBUG RAZORPAY ----------------");
//         console.log("Key ID Exists?", !!process.env.RAZORPAY_KEY_ID);
//         console.log("Key Secret Exists?", !!process.env.RAZORPAY_KEY_SECRET);
//         console.log("Key ID Value:", process.env.RAZORPAY_KEY_ID);
//         console.log("------------------------------------------------");
//         const instance = new Razorpay({
//             key_id: process.env.RAZORPAY_KEY_ID,
//             key_secret: process.env.RAZORPAY_KEY_SECRET,
//         });

//         const options = {
//             amount: Math.round(totalAmount * 100),
//             currency: "INR",
//             receipt: "order_rcptid_" + Date.now()
//         };
//         const order = await instance.orders.create(options);
//         return order;
//     } catch (error) {
//         throw error;
//     }
// };


const createRazorpayOrderService = async (userId, addressId, couponData) => {
    try {
     
        const cart = await Cart.findOne({ user_id: userId }).populate("items.variant_id").populate("items.product_id");
        if (!cart || cart.items.length === 0) throw new Error("Cart is empty");

        const address = await Address.findById(addressId);
        if (!address) throw new Error("Address not found");

               let totalOfferPrice = 0;
               let totalMrpPrice = 0;
        const orderItems = [];

       
        for (const item of cart.items) {
            const originalMRP=item.variant_id.price;
             const { finalPrice } = await calculateFinalPrice(item.product_id, item.variant_id.price); 
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
                 status: 'Payment Pending' 
             });
        }

        let totalOfferSaving=totalMrpPrice-totalOfferPrice;

        let couponDiscount  = couponData ? couponData.discount : 0;
        let finalPayable  = totalOfferPrice - couponDiscount;

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


        const newOrder = new Order({
            user_id: userId,
            status: "Payment Pending", 
            subtotal: totalMrpPrice,
             offer_discount: totalOfferSaving,
            discount_amount: couponDiscount,
            final_total: finalPayable,
            order_number: "ORD-" + Date.now(),
            address_id: addressId,
            shipping_address_snapshot: { ...address.toObject() }, 
            payment_method: "Online",
            items: orderItems,
         
          razorpay_order_id: rzpOrder.id
        });

        await newOrder.save();

        return rzpOrder; // Return ID to frontend
    } catch (error) {
        throw error;
    }
};



const retryPaymentService=async(orderId)=>{
    try {
        const order=await Order.findById(orderId);
        if(!order) throw new Error("Order not found");

        const instance=new  Razorpay({key_id:process.env.RAZORPAY_KEY_ID,
            key_secret:process.env.RAZORPAY_KEY_SECRET
        });

        const options={amount:Math.round(order.final_total*100),
            currency:"INR",receipt :"retry_rcptid_"+Date.now()
        };

        const rzpOrder=await instance.orders.create(options);

        order.razorpay_order_id=rzpOrder.id;
        order.status="Payment Pending";

        await order.save();

        return {...rzpOrder,address_id:order.address_id};
    } catch (error) {

        throw error;
        
    }
}



module.exports = {
    getCheckoutData,
    placeOrderService,
    validateCoupon,
    createRazorpayOrderService,
    retryPaymentService
}