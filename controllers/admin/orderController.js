const {
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  approveReturnService,
  rejectReturnService
} = require("../../services/adminSer/orderService")
const statusCode = require("../../utils/statusCodes.js");

const getOrderList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const data = await getAllOrders(page, limit, search, status);
    res.render("orderList", {
      orders: data.orders,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      search: search,
      status: status,
      activePage: "orders"
    });
  } catch (error) {
    console.error("Error fetching list:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send("internal server Error");
  }
};

const changeStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    console.log(`[DEBUG] Request to change status. ID: ${orderId}, New Status: ${status}`);

    if (!orderId || !status) {
      return res.status(statusCode.BAD_REQUEST).json({ success: false, message: "Missing required fields" });
    }
    const updatedOrder = await updateOrderStatus(orderId, status);
    console.log("[DEBUG] Order updated:", updatedOrder);

    res.json({
      success: true,
      message: "Order status updated successfully",
      newStatus: updatedOrder.status
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message || "Internal Server Error" });
  }
};


const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await getOrderById(orderId);

    if (!order) {
      return res.status(statusCode.NOT_FOUND).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal Server Error" });
  }
};


const approveReturn=async(req,res)=>{
  try {
    const {orderId,itemId}=req.body;
    const result=await approveReturnService(orderId,itemId);
    res.json(result);
  } catch (error) {
        console.error("Approve Return Error:", error);
        res.status(500).json({ success: false, message: error.message });
  }
}

const rejectReturn = async (req, res) => {
    try {
        const { orderId, itemId } = req.body;
        const result = await rejectReturnService(orderId, itemId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



module.exports = {
  getOrderList,
  changeStatus,
  getOrderDetails,
  approveReturn,
  rejectReturn
}