const Order = require("../../models/orders");
const User = require("../../models/user");
const Product = require("../../models/product");
const { now } = require("mongoose");


const getDashboardStats = async () => {
    try {
        const revenueData = await Order.aggregate([
            { $match: { status: "delivered" } },
            { $group: { _id: null, totalRevenue: { $sum: "$final_total" } } }
        ]);
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments({ isBlock: false });
        const totalProducts = await Product.countDocuments();

        return {
            totalRevenue: revenueData.length > 0 ? revenueData[0].totalRevenue : 0, totalOrders, totalUsers, totalProducts
        }

    } catch (error) {
        throw error;
    }
};



const getSalesChartData = async (filter) => {
    try {
        const now = new Date();
        let aggregationPipeline = [];
        let labels = [];
        let dataPoints = [];

        if (filter === "yearly") {
            aggregationPipeline = [
                { $match: { status: "delivered", createdAt: { $gte: new Date(now.getFullYear(), 0, 1) } } },
                { $group: { _id: { $month: "$createdAt" }, totalSales: { $sum: "$final_total" } } },
                { $sort: { "_id": 1 } }
            ];
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const rawData = await Order.aggregate(aggregationPipeline);
            labels = monthNames;
            dataPoints = new Array(12).fill(0);
            rawData.forEach(item => { dataPoints[item._id - 1] = item.totalSales; });

        } else if (filter === 'monthly') {
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            aggregationPipeline = [
                { $match: { status: "delivered", createdAt: { $gte: firstDayOfMonth } } },
                { $group: { _id: { $dayOfMonth: "$createdAt" }, totalSales: { $sum: "$final_total" } } },
                { $sort: { "_id": 1 } }
            ];
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const rawData = await Order.aggregate(aggregationPipeline);
            labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
            dataPoints = new Array(daysInMonth).fill(0);
            rawData.forEach(item => { dataPoints[item._id - 1] = item.totalSales; });
        } else if (filter === 'weekly') {
            const lastWeek = new Date(now);
            lastWeek.setDate(now.getDate() - 6);
            lastWeek.setHours(0, 0, 0, 0);
            aggregationPipeline = [
                { $match: { status: "delivered", createdAt: { $gte: lastWeek } } },
                { $group: { _id: { $dayOfWeek: "$createdAt" }, totalSales: { $sum: "$final_total" } } },
                { $sort: { "_id": 1 } }
            ];
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const rawData = await Order.aggregate(aggregationPipeline);
            labels = []; dataPoints = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now); d.setDate(now.getDate() - i);
                const dayIndex = d.getDay();
                labels.push(dayNames[dayIndex]);
                const found = rawData.find(item => item._id === (dayIndex + 1));
                dataPoints.push(found ? found.totalSales : 0);
            }
        } else if (filter === 'daily') {
            const todayStart = new Date(now.setHours(0, 0, 0, 0));
            aggregationPipeline = [
                { $match: { status: "delivered", createdAt: { $gte: todayStart } } },
                { $group: { _id: { $hour: "$createdAt" }, totalSales: { $sum: "$final_total" } } },
                { $sort: { "_id": 1 } }
            ];
            const rawData = await Order.aggregate(aggregationPipeline);
            labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
            dataPoints = new Array(24).fill(0);
            rawData.forEach(item => { dataPoints[item._id] = item.totalSales; });
        }
        return { labels, dataPoints };

    } catch (error) {
        throw error;
    }
}




const getTopSellingProducts = async () => {
    try {
        return await Order.aggregate([
            { $match: { status: "delivered" } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product_id",
                    name: { $first: "$items.name_snapshot" },
                    totalQty: { $sum: "$items.quantity" }

                }
            },
            { $sort: { totalQty: -1 } },
            { $limit: 10 }
        ]);
    } catch (error) {
        throw error
    }
};

const getTopSellingCategories = async () => {
    try {
        return await Order.aggregate([
            { $match: { status: "delivered" } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "categories",
                    localField: "product.categoryId",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $group: {
                    _id: "$category._id",
                    name: { $first: "$category.name" },
                    totalQty: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalQty: -1 } },
            { $limit: 10 }

        ]);
    } catch (error) {
        throw error;
    }
}




const getTopSellingBrands = async () => {
    try {
        return await Order.aggregate([
            { $match: { status: "delivered" } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "brands",
                    localField: "product.brandId",
                    foreignField: "_id",
                    as: "brand"
                }
            },
            { $unwind: "$brand" },
            {
                $group: {
                    _id: "$brand._id",
                    name: { $first: "$brand.name" },
                    totalQty: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalQty: -1 } },
            { $limit: 10 }
        ]);
    } catch (error) { throw error; }
};


module.exports = {
    getDashboardStats,
    getSalesChartData,
    getTopSellingProducts,
    getTopSellingCategories,
    getTopSellingBrands
}