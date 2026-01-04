const {
listCoupons,
createCouponService,
editCoupenService,
deleteCoupenService
} = require("../../services/adminSer/coupenServices");

const statusCode = require("../../utils/statusCodes.js");



const getCoupenList =async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const { coupons, totalPages, currentPage } = await listCoupons(page, 10, search);
        res.render("coupenList", {
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
}



const addCoupon = async (req, res) => {
    try {
        await createCouponService(req.body);
        res.status(statusCode.OK).json({ success: true, message: "Coupon created successfully" });
    } catch (error) {
        res.status(statusCode.BAD_REQUEST).json({ success: false, message: error.message });
    }
};


const editCoupen=async(req,res)=>{
    try {
        await editCoupenService(req.params.id,req.body);
        res.status(statusCode.OK).json({success:true,message:"Coupen updated successfully"});
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:error.message});
        
    }
}

const deleteCoupen=async(req,res)=>{
    try {
        await deleteCoupenService(req.params.id);
        res.status(statusCode.OK).json({success:true,message:"Coupen deleted"});
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({success:false,message:"Failed to delete coupen"});
    }
}


module.exports={
    getCoupenList,
    addCoupon,
    editCoupen,
    deleteCoupen
}