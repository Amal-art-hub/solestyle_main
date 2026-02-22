import { ConsoleMessage } from "puppeteer";
import Order from "../../models/orders.js";
import Variant from "../../models/varient.js";
import { creditWallet } from "./walletService.js";

export const getOrderDetailsService = async (orderId, userId) => {
    try {
        const order = await Order.findOne({ _id: orderId, user_id: userId })
            .populate({
                path: "items.product_id",
                select: "name"
            })
            .populate({
                path: "items.variant_id",
                select: "images"
            });

        if (!order) {
            throw new Error("Order not found or access denied");
        }
        return order;
    } catch (error) {
        console.error("Service Error in getOrderDetail:", error);
        throw error;
    }
};

// export const cancelOrderItemService = async (orderId, itemId, reason) => {
//     const order = await Order.findById(orderId);


//     if (!order) throw new Error("Order not found");

//     const item = order.items.id(itemId);
//     if (!item) throw new Error("Item not found");
//       if (item.status === "canceled") throw new Error("Item already canceled");
//     if (["shipped", "delivered"].includes(order.status)) {
//         throw new Error(`Cannot cancel item when order is ${order.status}`);
//     }


//      const totalPreCoupon = order.subtotal - order.offer_discount;





//     const itemOfferSavings=(item.original_price-item.unit_price*item.quantity);

//     order.offer_discount-=itemOfferSavings;


// const AfterOffrPrice=order.subtotal-order.offer_discount;
//     const itemDiscountRatio = item.total_amount / AfterOffrPrice;
//     const actualRefundAmount = item.total_amount - (order.discount_amount * itemDiscountRatio);

//     order.final_total -= item.total_amount;
//         console.log(order.subtotal );
//     console.log(item.original_price);
//     order.subtotal -= (item.original_price*item.quantity);
//     order.discount_amount -= (order.discount_amount * itemDiscountRatio);
//     order.final_total-=item.total_amount;

//     order.offer_discount-=item.original_price-item.unit_price;
//     console.log(order.offer_discount);

//     item.status = "canceled";
//     item.cancellation_reason = reason;

//     await Variant.findByIdAndUpdate(item.variant_id, { $inc: { stock: item.quantity } });

//     if (order.payment_method !== "COD") {
//         await creditWallet(
//             order.user_id,
//             Math.round(actualRefundAmount),
//             `Refund for cancellation of item in Order #${order.order_number}`
//         );
//     }

//     const allItemsCanceled = order.items.every(itm => itm.status === "canceled");
//     if (allItemsCanceled) {
//         order.status = "canceled";
//         order.cancellation_reason = reason;
//     }

//     await order.save();
//     return { success: true, message: "Item canceled successfully" };
// };

export const cancelOrderItemService = async (orderId, itemId, reason) => {
    // 1. Fetch Order and Item
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    const item = order.items.id(itemId);
    if (!item) throw new Error("Item not found");

    // 2. Safety Guards
    if (item.status === "canceled") throw new Error("Item already canceled");
    if (["shipped", "delivered"].includes(order.status)) {
        throw new Error(`Cannot cancel item when order is ${order.status}`);
    }



    // A. Pre-Coupon Total (This is the price the coupon was acting on)
    const orderTotalBeforeCoupon = order.subtotal - order.offer_discount;

    // B. Calculate Coupon Share (What part of the coupon does this item 'own'?)
    const itemRatio = item.total_amount / orderTotalBeforeCoupon;
    const couponShareForThisItem = order.discount_amount * itemRatio;

    // C. Calculate Offer Savings (The 'Ghost Discount' we need to remove)
    const itemOfferSavings = (item.original_price * item.quantity) - item.total_amount;

    // D. Update Database Fields (Subtracting all 3 components)
    order.subtotal -= (item.original_price * item.quantity);
    console.log(itemOfferSavings);
    order.offer_discount -= itemOfferSavings;

    console.log(order.offer_discount);
    order.discount_amount -= couponShareForThisItem;

    // E. The Safety Net: Synchronize the Grand Total

    order.final_total = Math.max(0, order.subtotal - order.offer_discount - order.discount_amount + (order.delivery_charge || 0));

    // F. Calculate Wallet Refund
    const refundAmount = item.total_amount - couponShareForThisItem;



    // 3. Update Status and Return Stock
    item.status = "canceled";
    item.cancellation_reason = reason;
    await Variant.findByIdAndUpdate(item.variant_id, { $inc: { stock: item.quantity } });

    // 4. Handle Wallet Refund
    if (order.payment_method !== "COD" && order.status !== "Payment Failed") {
        await creditWallet(
            order.user_id,
            Math.round(refundAmount), // Using Round for whole numbers in Wallet
            `Refund for cancellation of ${item.name_snapshot} (Order #${order.order_number})`
        );
    }

    // 5. If all items are canceled, cancel the entire order status
    const allCanceled = order.items.every(itm => itm.status === "canceled");
    if (allCanceled) {
        order.status = "canceled";
        order.cancellation_reason = reason;
    }

    // 6. Save and Finish
    await order.save();
    return { success: true, message: "Item canceled and refund processed correctly." };
};






export const cancelOrderService = async (orderId, reason) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.status === "canceled") throw new Error("Order already canceled");
    if (["shipped", "delivered"].includes(order.status)) throw new Error("Cannot cancel shipped or delivered order");

    for (const item of order.items) {
        if (item.status !== "canceled") {
            item.status = "canceled";
            item.cancellation_reason = reason || "Order Canceled";
            await Variant.findByIdAndUpdate(item.variant_id, { $inc: { stock: item.quantity } });
        }
    }

    order.status = "canceled";
    order.cancellation_reason = reason;

    if (order.payment_method !== "COD") {
        await creditWallet(
            order.user_id,
            order.final_total,
            `Refund for cancellation of Order #${order.order_number}`
        );
    }
    await order.save();

    return { success: true, message: "Order canceled successfully" };
};

export const returnOrderItemService = async (orderId, itemId, reason) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    const item = order.items.id(itemId);
    if (item.status === "returned") throw new Error("Item already returned");

    item.status = "Return Request";
    item.return_reason = reason;

    let allItemReturnRequested = order.items.every(item => item.status === "Return Request");

    if (allItemReturnRequested) {
        order.status = "Return Request";
    }

    await order.save();
    return { success: true, message: "Item returned succesfully" };
};

export const returnOrderService = async (orderId, reason) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");

        if (order.status === "returned") throw new Error("Order already returned");
        if (order.status !== "delivered") throw new Error("Order must be delivered to return it");

        for (const item of order.items) {
            if (item.status === "delivered") {
                item.status = "Return Request";
                item.return_reason = reason;
            }
        }

        order.status = "Return Request";
        order.return_reason = reason;

        await order.save();
        return { success: true, message: "Return requested successfully" };
    } catch (error) {
        console.error("SERVICE ERROR:", error);
        throw error;
    }
};