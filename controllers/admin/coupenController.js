import {
    listCoupons,
    createCouponService,
    editCouponService,
    deleteCoupenService
} from "../../services/adminSer/coupenServices.js";
import statusCode from "../../utils/statusCodes.js";

export const getCoupenList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const { coupons, totalPages, currentPage } = await listCoupons(page, 10, search);
        res.status(statusCode.OK).render("coupenList", {
            coupons,
            totalPages,
            currentPage,
            search,
            activePage: "coupons"
        });
    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Error");
    }
};

export const addCoupon = async (req, res) => {
    try {
        await createCouponService(req.body);
        res.status(statusCode.OK).json({ success: true, message: "Coupon created successfully" });
    } catch (error) {
        res.status(statusCode.BAD_REQUEST).json({ success: false, message: error.message });
    }
};

export const editCoupen = async (req, res) => {
    try {
        await editCouponService(req.params.id, req.body);
        res.status(statusCode.OK).json({ success: true, message: "Coupen updated successfully" });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
};

export const deleteCoupen = async (req, res) => {
    try {
        await deleteCoupenService(req.params.id);
        res.status(statusCode.OK).json({ success: true, message: "Coupen deleted" });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Failed to delete coupen" });
    }
};