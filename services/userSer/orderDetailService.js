const Order = require("../../models/orders");
const Variant = require("../../models/varient");
const {creditWallet} = require("./walletService");

const getOrderDetailsService = async (orderId, userId) => {
    try {

        const order = await Order.findOne({ _id: orderId, user_id: userId })
            .populate({
                path: 'items.product_id',
                select: 'name'
            })
            .populate({
                path: 'items.variant_id',
                select: 'images'
            });

        if (!order) {
            throw new Error("Order not found or access denied");
        }

        // order.status = 'delivered';
        // order.items.forEach(item => item.status = 'delivered');

        return order;
    } catch (error) {
        console.error("Service Error in getOrderDetail:", error);
        throw error;
    }
};

const cancelOrderItemService = async (orderId, itemId, reason) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");

        const item = order.items.id(itemId);
        if (!item) throw new Error("Item not found");
        if (item.status === 'canceled') throw new Error("Item already canceled");
        if (order.status === 'delivered') throw new Error("Cannot cancel delivered item");

        item.status = 'canceled';
        item.cancellation_reason = reason;

        order.final_total = order.final_total - item.total_amount;
        order.subtotal = order.subtotal - item.total_amount;

        await Variant.findByIdAndUpdate(item.variant_id, { $inc: { stock: item.quantity } });

            if (order.payment_method !== "COD") {  
             await creditWallet(
                order.user_id, 
                item.total_amount, 
                `Refund for cancellation of item in Order #${order.order_number}`
            );
        }

  
        const allItemsCanceled = order.items.every(itm => itm.status === 'canceled');
        if (allItemsCanceled) {
            order.status = 'canceled';
            order.cancellation_reason = reason;
        }

        await order.save();
        return { success: true, message: "Item canceled successfully" };
    } catch (error) {
        throw error;
    }
};



const cancelOrderService = async (orderId, reason) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");

        if (order.status === 'canceled') throw new Error("Order already canceled");
        if (['shipped', 'delivered'].includes(order.status)) throw new Error("Cannot cancel shipped or delivered order");

        for (const item of order.items) {

            if (item.status !== 'canceled') {
                item.status = 'canceled';
                item.cancellation_reason = reason || "Order Canceled";
                await Variant.findByIdAndUpdate(item.variant_id, { $inc: { stock: item.quantity } });
            }
        }

        order.status = 'canceled';
        order.cancellation_reason = reason;


           if (order.payment_method !== "COD") {
             await walletService.creditWallet(
                order.user_id, 
                order.final_total, 
                `Refund for cancellation of Order #${order.order_number}`
            );
        }
        await order.save();

        return { success: true, message: "Order canceled successfully" };
    } catch (error) {
        throw error;
    }
};


const returnOrderItemService = async (orderId, itemId, reason) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");

        const item = order.items.id(itemId);
        if (item.status === "returned") throw new Error("Item already returned");

        item.status = "Return Request";
        item.return_reason = reason;

        // await Variant.findByIdAndUpdate(item.variant_id, { $inc: { stock: item.quantity } });

        await order.save();
        return { success: true, message: "Item returned succesfully" };
    } catch (error) {
        throw error;
    }
}



const returnOrderService = async (orderId, reason) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");


        if (order.status === 'returned') throw new Error("Order already returned");
        if (order.status !== 'delivered') throw new Error("Order must be delivered to return it");


        for (const item of order.items) {

            if (item.status === 'delivered') {
                item.status = 'Return Request';
                item.return_reason = reason;


                // await Variant.findByIdAndUpdate(item.variant_id, { $inc: { stock: item.quantity } });
            }
        }

        order.status = 'Return Request';
        order.return_reason = reason;

        await order.save();
        return { success: true, message: "Return requested successfully" };
    } catch (error) {
        console.error("SERVICE ERROR:", error);
        throw error;
    }
};




module.exports = {
    getOrderDetailsService,
    cancelOrderItemService,
    cancelOrderService,
    returnOrderItemService,
    returnOrderService
};