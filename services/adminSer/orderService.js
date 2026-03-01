import Order from "../../models/orders.js";
import Variant from "../../models/varient.js";
import * as walletService from "../../services/userSer/walletService.js";

export const getAllOrders = async (page = 1, limit = 5, search = "", status = "") => {
  const skip = (page - 1) * limit;
  let query = {};

  if (search) {
    query.order_number = { $regex: search, $options: "i" };
  }
  if (status) {
    query.status = status;
  }
  const totalOrders = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate("user_id", "name email")
    .sort({ order_date: -1 })
    .skip(skip)
    .limit(limit);

  return {
    orders,
    totalOrders,
    totalPages: Math.ceil(totalOrders / limit),
    currentPage: parseInt(page),
  };
};

export const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  const oldStatus = order.status;
  if (oldStatus === "canceled") {
    throw new Error("Order is already canceled");
  }


  order.status = newStatus;

  // Update dates if specific milestones are hit
  if (newStatus === "delivered") order.delivered_date = new Date();
  if (newStatus === "shipped") order.shipped_date = new Date();

  // Unified Item Status Sync (Always keep items in sync with the main order, 
  // but protect items that were already individually canceled or returned)
  order.items.forEach(item => {
    if (item.status !== "canceled" && item.status !== "returned") {
      item.status = newStatus;
    }
  });


  if (newStatus === "canceled" && oldStatus !== "canceled") {
    for (const item of order.items) {
      if (item.variant_id) {
        await Variant.findByIdAndUpdate(item.variant_id, {
          $inc: { stock: item.quantity }
        });
      }
    }
    if (order.payment_method !== "COD" && oldStatus !== "Payment Failed") {
      await walletService.creditWallet(
        order.user_id,
        order.final_total,
        `Refund for Order #${order.order_number} (Canceled by Administrator)`
      );
    }




  }




  await order.save();
  return order;
};

export const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate("user_id", "name email phone")
    .populate("items.product_id", "productName")
    .populate("items.variant_id", "images size color")
    .populate("address_id");

  return order;
};

export const approveReturnService = async (orderId, itemId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  const item = order.items.id(itemId);
  if (item.status !== "Return Request") {
    throw new Error("Item is not pending return approval");
  }

  // let refundAmount = item.total_amount;

  // if (order.discount_amount && order.discount_amount > 0) {
  //   const currentSubtotal = order.items.reduce((sum, i) => sum + i.total_amount, 0);
  //   const itemDiscountPortion = (item.total_amount / currentSubtotal) * order.discount_amount;
  //   refundAmount = item.total_amount - itemDiscountPortion;
  //   refundAmount = Math.round(refundAmount);
  // }

  const orderTotalBeforeCoupen = order.subtotal - order.offer_discount;

  const coupenShareForThisItem = orderTotalBeforeCoupen > 0 ? (order.discount_amount * (item.total_amount / orderTotalBeforeCoupen)) : 0;

  const itemOfferSavings = (item.original_price * item.quantity) - item.total_amount;

  order.subtotal -= (item.original_price * item.quantity);

  order.offer_discount -= itemOfferSavings;

  order.discount_amount -= coupenShareForThisItem;

  order.final_total = Math.max(0, order.subtotal - order.offer_discount - order.discount_amount + (order.delivery_charge || 0));


  // F. Calculate Wallet Refund (Using Math.round for clean numbers)
  const refundAmount = Math.round(item.total_amount - coupenShareForThisItem);





  item.status = "returned";

  if (item.variant_id) {
    await Variant.findByIdAndUpdate(item.variant_id, {
      $inc: { stock: item.quantity }
    });
  }

  await walletService.creditWallet(
    order.user_id,
    refundAmount,
    `Refund for returned item: ${item.name_snapshot} (Order #${order.order_number})`
  );

  const allVoided = order.items.every(item => ["returned", "canceled"].includes(item.status));
  if (allVoided) {
    const hasAnyReturn = order.items.some(item => item.status === "returned");
    if (hasAnyReturn) {
      order.status = "returned";
    } else {
      order.status = "canceled";
    }
  } // <--- This closes the 'if (allVoided)'
  // 5. This MUST be outside all 'if' blocks to always save
  await order.save();
  return { success: true, message: "Return Approved & Refunded" };
};

export const rejectReturnService = async (orderId, itemId) => {
  const order = await Order.findById(orderId);
  const item = order.items.id(itemId);
  if (item.status !== "Return Request") throw new Error("Invalid Status");
  item.status = "Return Rejected";

  let allItemRejected = order.items.every(item => item.status === "Return Rejected");

  if (allItemRejected) { order.status = "Return Rejected"; }
  await order.save();
  return { success: true, message: "Return Rejected" };
};