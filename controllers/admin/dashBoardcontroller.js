import {
    getDashboardStats,
    getSalesChartData,
    getTopSellingProducts,
    getTopSellingCategories,
    getTopSellingBrands
} from "../../services/adminSer/dashboardService.js";
import statusCode from "../../utils/statusCodes.js";

export const loadDashboard = async (req, res) => {
    try {
        const [stats, chartData, topProducts, topCategories, topBrands] = await Promise.all([
            getDashboardStats(),
            getSalesChartData("monthly"),
            getTopSellingProducts(),
            getTopSellingCategories(),
            getTopSellingBrands()
        ]);
        res.status(statusCode.OK).render("dashboard", {
            stats, chartData, topProducts, topCategories, topBrands,
            activePage: "dashboard"
        });
    } catch (error) {
        console.error(error);
        res.redirect("/pageNotFound");
    }
};

export const getChartDataAPI = async (req, res) => {
    try {
        const { filter } = req.query;
        const data = await getSalesChartData(filter);
        res.status(statusCode.OK).json(data);
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, error: "Database failed" });
    }
};