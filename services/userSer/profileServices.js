const User = require("../../models/user.js");
const Address = require("../../models/address.js");
const Coupon = require("../../models/Coupen");
const bcrypt = require("bcrypt");
const { generateOtp, sendVerificationEmail } = require("./userService");




//--------------------------------------------------------loading user profile
const getUserProfile = async (userId) => {
    return await User.findById(userId).select("-password");
};

//----------------------------------------------------------updating edited data on  profile

const updateUserProfile = async (userId, data) => {
    return await User.findByIdAndUpdate(userId, data, { new: true }).select("-password");
};


//-----------------------------------------updating password

const changePassword = async (userId, oldPass, newPass) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) throw new Error("Incorrect current password");

    user.password = await bcrypt.hash(newPass, 10);
    await user.save();
    return { message: "Password updated successfully" };
};

//-------------------------------requesting email otp

const requestEmailChange = async (userId, newEmail) => {
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) throw new Error("Email already in use");

    const otp = generateOtp(); // Using existing generateOtp
    const expiry = Date.now() + 10 * 60 * 1000; // 10 mins

    await User.findByIdAndUpdate(userId, {
        "emailChangeRequest.newEmail": newEmail,
        "emailChangeRequest.otp": otp,
        "emailChangeRequest.otpExpiry": expiry
    });

    await sendVerificationEmail(newEmail, otp); // Using existing sendVerificationEmail
    return { message: "OTP sent to new email" };
};

//---------------------------verify otp

const verifyOtp = async (typedOtp, sessionOtp, userId, newEmail) => {

    try {
        console.log("--- OTP DEBUG ---");
        console.log("Typed:", typedOtp, typeof typedOtp);
        console.log("Session:", sessionOtp, typeof sessionOtp);
        console.log("Equal?", String(typedOtp).trim() === String(sessionOtp).trim());
        console.log("-----------------");

        if (!sessionOtp) {
            return { success: false, message: "Session expired. Please request a new OTP." };
        }

        if (String(typedOtp).trim() !== String(sessionOtp).trim()) {
            return { success: false, message: "Invalid OTP (Mismatch)" };
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { email: newEmail }, { new: true });
        if (!updatedUser) {
            return { success: false, message: "user not found" };
        }

        return { success: true, message: "Email updated successfully", user: updatedUser };

    } catch (error) {
        console.error(error);
        return { success: false, message: "Something went wrong" };
    }


};

const getAddressByUserId = async (userId) => {
    return await Address.find({ user_id: userId });
};


const addAddressService = async (userId, addressData) => {
    if (addressData.is_default_shipping === "true" || addressData.is_default_shipping === true) {
        await Address.updateMany({ user_id: userId }, { is_default_shipping: false });
    }

    if (addressData.is_default_billing === "true" || addressData.is_default_billing === true) {
        await Address.updateMany({ user_id: userId }, { is_default_billing: false });
    }
    const newAddress = new Address({ user_id: userId, ...addressData });
    return await newAddress.save();
};


const editAddressService = async (addressId, userId, addressData) => {

    if (addressData.is_default_shipping === "true" || addressData.is_default_shipping === true) {
        await Address.updateMany({ user_id: userId }, { is_default_shipping: false });
    }


    if (addressData.is_default_billing === "true" || addressData.is_default_billing === true) {
        await Address.updateMany({ user_id: userId }, { is_default_billing: false });
    }

    return await Address.findOneAndUpdate(
        { _id: addressId, user_id: userId },
        addressData,
        { new: true }
    );
};


const deleteAddressServic = async (addressId, userId) => {
    return await Address.findOneAndDelete({ _id: addressId, user_id: userId });
};


const getCoupons = async (userId) => {
    const wallet = await User.findById(userId).select("wallet"); // Assuming wallet is part of User model
    const walletBalance = wallet && wallet.wallet ? wallet.wallet.balance : 0;

    return await Coupon.find({
        isDeleted: false,
        expiry_date: { $gt: new Date() },
        min_purchase_amount: { $lte: walletBalance } // Example logic
    });
};


module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword,
    requestEmailChange,
    verifyOtp,
    getAddressByUserId,
    addAddressService,
    editAddressService,
    deleteAddressServic,
    getCoupons
};