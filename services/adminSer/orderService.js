const Order = require("../../models/orders");


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

module.exports = {
    getAllOrders,
    updateOrderStatus,
    getOrderById
}