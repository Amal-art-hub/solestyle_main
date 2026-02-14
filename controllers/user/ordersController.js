import {
  OrdersListService
} from "../../services/userSer/ordersService.js";
import statusCode from "../../utils/statusCodes.js";

import ejs from "ejs";
import path from "path";
import User from "../../models/user.js";

export const listOrder = async (req, res) => {
  try {
    const userId = req.session.user;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const searchQuery = req.query.search || "";
    const result = await OrdersListService(userId, page, limit, searchQuery);

    res.status(statusCode.OK).render("orders", {
      orders: result.orders,
      currentPage: page,
      totalPages: result.totalPages,
      searchQuery,
      user: User
    });
  } catch (error) {
    console.error(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
  }
};

export const cancelOrderItem = async (req, res) => {

};