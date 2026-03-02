import {
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
} from "../../services/userSer/profileServices.js";
import Offers from "../../models/offers.js";
import statusCode from "../../utils/statusCodes.js";

//--------------------------------------------------------------------------------- Load User Profile
export const loadProfile = async (req, res) => {
    try {
        const userId = req.session.user._id;

        const user = await getUserProfile(userId);
        const coupons = await getCoupons(userId);

        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const referralOffer = await Offers.findOne({ type: "referral", status: "active" });
        const referralDiscount = referralOffer ? referralOffer.discount_percentage : 10;
        res.status(statusCode.OK).render("profile", { user, coupons, referralDiscount, baseUrl });
    } catch (error) {
        console.error("Profile looad Error:", error);
        res.redirect("/");
    }
};

//---------------------------------------------------------------------------------updating edit profile
export const updateProfile = async (req, res) => {
    try {
        await updateUserProfile(req.session.user._id, req.body);
        res.status(statusCode.OK).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("update profile error", error);

        let message = "Failed to update profile";
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        } else if (error.message) {
            message = error.message;
        }

        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message });
    }
};

//---------------------------------------------------------password update
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        const result = await changePassword(req.session.user._id, currentPassword, newPassword);

        if (!result.success) {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message: result.message
            });
        }

        res.status(statusCode.OK).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Update Password Error:", error);
        res.status(statusCode.BAD_REQUEST).json({
            success: false,
            message: error.message || "Server Error occurred while updating password"
        });
    }
};

//------------------------------loadchangemail
export const loadChangeEmail = async (req, res) => {
    try {
        console.log("debugging:", req.session.user);
        res.status(statusCode.OK).render("profile-emailchange", { user: req.session.user });
    } catch (error) {
        console.log("error in loading email", error);
    }
};

//-------------------------------request for emailchangeotp
export const requestEmailOtp = async (req, res) => {
    try {
        const result = await requestEmailChange(req.session.user._id, req.body.newEmail);
        if (!result.success) return res.render("profile-emailchange", { error: result.message || "Failed to send OTP" });

        req.session.emailChange = { email: req.body.newEmail, otp: result.otp };
        res.status(statusCode.OK).render("changeEmailVerifyOtp", { newEmail: req.body.newEmail });

    } catch (error) {
        console.error("result email otp error:", error);
        res.render("profile-emailchange", { error: error.message || "Server Error" });
    }
};

//--------------------------------resend email otp
export const resendEmailOtp = async (req, res) => {
    try {
        if (!req.session.emailChange?.email) {
            return res.status(statusCode.BAD_REQUEST).json({ success: false, message: "No pending email change" });
        }

        const result = await requestEmailChange(req.session.user._id, req.session.emailChange.email);
        if (result.success) {
            req.session.emailChange.otp = result.otp;
            return res.status(statusCode.OK).json({ success: true, message: "OTP Resent Successfully" });
        }
        res.status(statusCode.BAD_REQUEST).json({ success: false, message: "Failed to resend OTP" });
    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message || "Server Error" });
    }
};

export const verifyEmailOtp = async (req, res) => {
    try {
        const result = await verifyOtp(
            req.body.otp,
            req.session.emailChange.otp,
            req.session.user._id,
            req.session.emailChange.email
        );

        if (!result.success) {
            return res.status(statusCode.BAD_REQUEST).json({ success: false, message: result.message });
        }

        // Success Case
        req.session.emailChange = null;
        return res.status(statusCode.OK).json({ success: true, message: "Email changed successfully!" });

    } catch (error) {
        console.log(error);
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server Error" });
    }
};

//--------------------------------------------------------------------
const validateAddress = (data) => {
    const { name, phone, postal_code, city, state, address_line1 } = data;
    const errors = {};

    // 1. Name: Only letters and spaces, at least 3 chars
    if (!/^[a-zA-Z\s]{3,}$/.test(name?.trim())) {
        errors.name = "Name must contain at least 3 letters";
    }

    // 2. Phone: Exactly 10 digits
    if (!/^\d{10}$/.test(phone)) {
        errors.phone = "Invalid Phone Number";
    }

    // 3. Pincode: Exactly 6 digits
    if (!/^\d{6}$/.test(postal_code)) {
        errors.pincode = "Invalid Pincode";
    }

    // 4. City/State: Only letters and spaces, at least 2 chars
    if (!/^[a-zA-Z\s]{2,}$/.test(city?.trim())) {
        errors.city = "Invalid City name";
    }
    if (!/^[a-zA-Z\s]{2,}$/.test(state?.trim())) {
        errors.state = "Invalid State name";
    }

    // 5. Address Line 1: Must contain at least some letters or numbers
    if (!/[a-zA-Z0-9]/.test(address_line1?.trim())) {
        errors.address_line1 = "Address line 1 is required and cannot be just symbols";
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};

export const loadAddressPage = async (req, res) => {
    try {
        const addresses = await getAddressByUserId(req.session.user._id);
        res.status(statusCode.OK).render("addresses", { addresses, user: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
    }
};

export const addAddress = async (req, res) => {
    try {
        const validation = validateAddress(req.body);
        if (!validation.isValid) {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message: "Validation Failed",
                errors: validation.errors
            });
        }

        const userId = req.session.user._id;
        const data = req.body;

        await addAddressService(userId, data);
        res.status(statusCode.OK).json({ success: true, message: "Address added successfully" });
    } catch (error) {
        console.error("Add address error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server Error" });
    }
};

export const editAddress = async (req, res) => {
    try {
        const validation = validateAddress(req.body);
        if (!validation.isValid) {
            return res.status(statusCode.BAD_REQUEST).json({
                success: false,
                message: "Validation Failed",
                errors: validation.errors
            });
        }
        const userId = req.session.user._id;
        const addressId = req.params.id;
        const data = req.body;
        await editAddressService(addressId, userId, data);

        res.status(statusCode.OK).json({ success: true, message: "Address updated successfully" });
    } catch (error) {
        console.error("Edit Address Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server Error" });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const addressId = req.params.id;
        await deleteAddressServic(addressId, userId);

        res.status(statusCode.OK).json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
        console.error("Delete Address Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server Error" });
    }
};
