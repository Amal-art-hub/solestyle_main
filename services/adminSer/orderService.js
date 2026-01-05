const Order = require("../../models/orders");
const Variant = require("../../models/varient");
const walletService = require("../../services/userSer/walletService");


const getAllOrders = async (page = 1, limit = 5, search = "", status = "") => {
    try {
        const skip = (page - 1) * limit;
        let query = {};

        if (search) {
            query.order_number = { $regex: search, $option: "i" };
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

    } catch (error) {
        throw error;
    }
};



const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }


    order.status = newStatus;

    // Update individual items' status to match order status
    if (newStatus === "delivered") {
      order.delivered_date = new Date();
      order.items.forEach(item => {
        if (item.status !== 'canceled' && item.status !== 'returned') {
          item.status = 'delivered';
        }
      });
    }
    
    if (newStatus === "shipped") {
      order.shipped_date = new Date();
      order.items.forEach(item => {
        if (item.status !== 'canceled' && item.status !== 'returned') {
          item.status = 'shipped';
        }
      });
    }

    await order.save();
    return order;
  } catch (error) {
    throw error;
  }
};

const getOrderById=async (orderId)=> {
try {
const order=await Order.findById(orderId)
      .populate("user_id","name email phone")
      .populate("items.product_id","productName")
       .populate("items.variant_id", "images size color")

      .populate("address_id");

return order;
  }catch (error) {
throw error;
  }
};

const approveReturnService = async (orderId, itemId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");
        const item = order.items.id(itemId);
        if (item.status !== "Return Request") {
            throw new Error("Item is not pending return approval");
        }
        // 1. Update Status
        item.status = "returned";
        // 2. Restock Inventory
        if (item.variant_id) {
            await Variant.findByIdAndUpdate(item.variant_id, {
                $inc: { stock: item.quantity }
            });
        }
        // 3. Refund to Wallet
        await walletService.creditWallet(
            order.user_id,
            item.total_amount, // Refund actual paid amount for this item
            `Refund for Order #${order.order_number}`
        );
        await order.save();
        return { success: true, message: "Return Approved & Refunded" };
    } catch (error) {
        throw error;
    }
};

const rejectReturnService = async (orderId, itemId) => {
    try {
        const order = await Order.findById(orderId);
        const item = order.items.id(itemId);
        if (item.status !== "Return Request") throw new Error("Invalid Status");
        item.status = "Return Rejected"; // Or revert to previous status if preferred
        await order.save();
        return { success: true, message: "Return Rejected" };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllOrders,
    updateOrderStatus,
    getOrderById,
    approveReturnService,
    rejectReturnService
}