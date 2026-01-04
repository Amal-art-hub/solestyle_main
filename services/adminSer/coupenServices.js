const Coupen = require("../../models/Coupen");
const Coupon = require("../../models/Coupen");



const validateCouponData = (data) => {
   
    if (!data.code || data.code.trim() === "") throw new Error("Coupon Code is required");
    if (/\s/.test(data.code)) throw new Error("Coupon Code cannot contain spaces");
    if (data.code.length < 3) throw new Error("Code must be at least 3 characters long");
   
    if (!data.discount_value || isNaN(data.discount_value) || data.discount_value <= 0) {
        throw new Error("Discount value must be a positive number");
    }
    
    if (data.discount_type === 'Percentage') {
        if (data.discount_value > 90) throw new Error("Percentage discount cannot exceed 90%");
    } else {
       
        if (data.discount_value > 10000) throw new Error("Fixed discount seems too high");
    }

    if (!data.expiry_date) throw new Error("Expiry Date is required");
    

    const expiry = new Date(data.expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    if (expiry < today) throw new Error("Expiry Date cannot be in the past");
};



const listCoupons = async (page = 1, limit = 10, search = "") => {
    const query = {};
    if (search) query.code = { $regex: new RegExp(search, "i") };
    const coupons = await Coupon.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const count = await Coupon.countDocuments(query);
    return { coupons, totalPages: Math.ceil(count / limit), currentPage: page };


};


const createCouponService = async (data) => {
    validateCouponData(data); 
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new Error("Coupon Code already exists (Duplicate)");
    const coupon = new Coupon({ 
        ...data, 
        code: data.code.toUpperCase() 
    });
    return await coupon.save();
};

const editCoupenService=async(id,data)=>{

    if(!data.code||data.code.trim()==="")throw new Error("Coupen code is required");
    if(data.discount_value<=0)throw new Error("Invalid Discount value");
    const existing=await Coupon.findOne({
        code:data.code.toUpperCase(),
        _id:{$ne:id}
    });
    if(existing) throw new Error("Coupen code already taken by another coupen");
 return await Coupon.findByIdAndUpdate(id,{
    ...data,
      code: data.code.toUpperCase()
 },{new:true} ); 
};


const deleteCoupenService=async(id)=>{
    return await Coupen.findByIdAndDelete(id);
}


module.exports={
    listCoupons,
    createCouponService,
    editCoupenService,
    deleteCoupenService
}