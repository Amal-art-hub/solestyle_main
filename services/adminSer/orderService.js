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

  let refundAmount = item.total_amount;

  if (order.discount_amount && order.discount_amount > 0) {
    const currentSubtotal = order.items.reduce((sum, i) => sum + i.total_amount, 0);
    const itemDiscountPortion = (item.total_amount / currentSubtotal) * order.discount_amount;
    refundAmount = item.total_amount - itemDiscountPortion;
    refundAmount = Math.round(refundAmount);
  }

  item.status = "returned";

  if (item.variant_id) {
    await Variant.findByIdAndUpdate(item.variant_id, {
      $inc: { stock: item.quantity }
    });
  }

  await walletService.creditWallet(
    order.user_id,
    refundAmount,
    `Refund for Order #${order.order_number}`
  );

  const allItemReturned = order.items.every(item => item.status === "returned");
  const allItemcanceled = order.items.every(item => item.status === "canceled");

  if (allItemReturned) {
    order.status = "returned";
  }

  if (allItemcanceled) {
    order.status = "canceled";
  }

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