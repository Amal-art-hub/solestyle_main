import {
  getAllCategories,
  createCategory,
  editCategoryService,
  toggleCategoryStatus
} from "../../services/adminSer/categoryServices.js";
import statusCode from "../../utils/statusCodes.js";

export const categoryInfo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const data = await getAllCategories(page, 4, search);

    res.status(statusCode.OK).render("CategoryManag", {
      cat: data.categories,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
      search: search,
      activePage: "categories",
    });
  } catch (error) {
    console.log(error);
    res.redirect("/page-404");
  }
};

export const addCategory = async (req, res) => {
  try {
    const result = await createCategory(req.body);
    if (!result.success) {
      return res.status(statusCode.BAD_REQUEST).json(result);
    }
    res.status(statusCode.OK).json(result);
  } catch (error) {
    console.error(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
  }
};

export const editCategory = async (req, res) => {
  try {
    const result = await editCategoryService(req.body);
    if (!result.success) {
      return res.status(statusCode.BAD_REQUEST).json(result);
    }
    res.status(statusCode.OK).json(result);
  } catch (error) {
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "server error" });
  }
};

export const getListStatus = async (req, res) => {
  try {
    const result = await toggleCategoryStatus(req.query.id);
    if (!result.success) {
      return res.status(statusCode.BAD_REQUEST).json(result);
    }
    res.status(statusCode.OK).json(result);
  } catch (error) {
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
  }
};
