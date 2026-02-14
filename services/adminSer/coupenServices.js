import Coupon from "../../models/Coupen.js";

const validateCouponData = (data) => {
    if (!data.code || data.code.trim() === "") throw new Error("Coupon Code is required");
    if (/\s/.test(data.code)) throw new Error("Coupon Code cannot contain spaces");
    if (data.code.length < 3) throw new Error("Code must be at least 3 characters long");

    if (!data.discount_value || isNaN(data.discount_value) || data.discount_value <= 0) {
        throw new Error("Discount value must be a positive number");
    }

    // Check mincart_value
    const minCart = parseFloat(data.mincart_value) || 0;
    if (minCart < 0) throw new Error("Minimum cart value cannot be negative");

    if (data.discount_type === "Percentage") {
        if (data.discount_value > 90) throw new Error("Percentage discount cannot exceed 90%");
    } else {
        if (data.discount_value > 10000) throw new Error("Fixed discount seems too high");

        // Logical check: Fixed discount shouldn't exceed or equal min cart value
        if (data.discount_value >= minCart && minCart > 0) {
            throw new Error("Fixed discount cannot be greater than or equal to Minimum Cart Value");
        }
    }

    if (!data.expiry_date) throw new Error("Expiry Date is required");

    const expiry = new Date(data.expiry_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiry < today) throw new Error("Expiry Date cannot be in the past");
};

export const listCoupons = async (page = 1, limit = 10, search = "") => {
    const query = {};
    if (search) query.code = { $regex: new RegExp(search, "i") };
    const coupons = await Coupon.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    const count = await Coupon.countDocuments(query);
    return { coupons, totalPages: Math.ceil(count / limit), currentPage: page };
};

export const createCouponService = async (data) => {
    validateCouponData(data);
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new Error("Coupon Code already exists (Duplicate)");
    const coupon = new Coupon({
        ...data,
        code: data.code.toUpperCase()
    });
    return await coupon.save();
};

export const editCouponService = async (id, data) => {
    validateCouponData(data);

    const existing = await Coupon.findOne({
        code: data.code.toUpperCase(),
        _id: { $ne: id }
    });
    if (existing) throw new Error("Coupon code already taken by another coupon");

    return await Coupon.findByIdAndUpdate(id, {
        ...data,
        code: data.code.toUpperCase()
    }, { new: true });
};

export const deleteCoupenService = async (id) => {
    return await Coupon.findByIdAndDelete(id);
};