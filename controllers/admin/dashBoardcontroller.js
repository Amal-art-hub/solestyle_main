const { getDashboardStats,
    getSalesChartData,
    getTopSellingProducts,
    getTopSellingCategories,
    getTopSellingBrands
 } = require("../../services/adminSer/dashboardService");
const statusCode = require("../../utils/statusCodes.js");
const loadDashboard = async (req, res) => {
    try {
        const [stats, chartData, topProducts, topCategories, topBrands] = await Promise.all([
            getDashboardStats(),
            getSalesChartData('monthly'),
            getTopSellingProducts(),
            getTopSellingCategories(),
            getTopSellingBrands()
        ]);
        res.render("dashboard", { 
            stats, chartData, topProducts, topCategories, topBrands,
            activePage: 'dashboard' 
        });
    } catch (error) {
        console.error(error);
        res.redirect("/pageNotFound");
    }
};

const getChartDataAPI=async(req,res)=>{
    try {
        const {filter}=req.query;
        const data=await getSalesChartData(filter);
        res.json(data);
    } catch (error) {
        res.status(500).json({success:false,error:"Database failed"});
    }
}






module.exports={
     loadDashboard,
     getChartDataAPI
}