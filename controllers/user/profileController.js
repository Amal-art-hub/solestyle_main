const {
    getUserProfile,
    updateUserProfile,
    changePassword,
    requestEmailChange,
    verifyOtp,
    getAddressByUserId,
    addAddressService,
    editAddressService,
    deleteAddressServic

} = require("../../services/userSer/profileServices");
const statusCode = require("../../utils/statusCodes");




//--------------------------------------------------------------------------------- Load User Profile
const loadProfile = async (req, res) => {
    try {
        const user = await getUserProfile(req.session.user._id);
        res.render("profile", { user })
    } catch (error) {
        console.error("Profile looad Error:", error);
        res.redirect("/");
    }
}


//---------------------------------------------------------------------------------updating edit profile


const updateProfile = async (req, res) => {
    try {
        await updateUserProfile(req.session.user._id, req.body);
        res.redirect("/user/profile?message=profile updated");
    } catch (error) {
        console.error("update profile error", error);
        res.redirect("/user/profile?error?Update failed");

    }
}

//------------------------------------updating password

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) return res.redirect("/user/profile?error=Password do not match");

        const result = await changePassword(req.session.user._id, currentPassword, newPassword);
        if (!result.success) return res.redirect("/user/profile?error=${result.message}");
        res.redirect("/user/profile?message=Password changed");
    } catch (error) {
        console.error("Update Password Error:", error);
        res.redirect("/user/profile?error=Server Error");

    }
}

//------------------------------loadchangemail

const loadChangeEmail = async (req, res) => {
    try {
        console.log("debugging:", req.session.user);
        res.render("profile-emailchange", { user: req.session.user })
    } catch (error) {
        console.log("error in loading email", error);
    }
}

//-------------------------------request for emailchangeotp
const requestEmailOtp = async (req, res) => {
    try {
        const result = await requestEmailChange(req.session.user._id, req.body.newEmail);
        if (!result.success) return res.json({ success: false, message: "Failed" });
        req.session.emailChange = { email: req.body.newEmail, otp: result.otp };
        res.render("changeEmailVerifyOtp", { newEmail: req.body.newEmail });

    } catch (error) {
        console.error("result email otp error:", error);
        res.render("profile-emailchange", { error: "Server Error" });
    }

};

const verifyEmailOtp = async (req, res) => {
    try {
        const result = await verifyOtp(
            req.body.otp,
            req.session.emailChange.otp,
            req.session.user._id,
            req.session.emailChange.email
        );

        if (!result.success) {
            // FIX: Send JSON, not HTML (Render)
            return res.json({ success: false, message: result.message });
        }

        // Success Case
        req.session.emailChange = null;
        // FIX: Send JSON success
        return res.json({ success: true, message: "Email changed successfully!" });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Server Error" });
    }
}

//--------------------------------------------------------------------
const validateAddress = (data) => {
    const { name, phone, postal_code, city, state } = data;
    const errors = {};
    if (!name || name.trim().length < 3) errors.name = "Name is too short";
    if (!/^\d{10}$/.test(phone)) errors.phone = "Invalid Phone Number";
    if (!/^\d{6}$/.test(postal_code)) errors.pincode = "Invalid Pincode";
    if (!city || city.trim().length < 2) errors.city = "City is required";
    return { isValid: Object.keys(errors).length === 0, errors };
}

const loadAddressPage = async (req, res) => {
    try {
        const addresses = await getAddressByUserId(req.session.user._id);
        res.render("addresses", { addresses, user: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404")

    }
}

const addAddress = async (req, res) => {
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
}


const editAddress = async (req, res) => {
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

const deleteAddress = async (req, res) => {
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




module.exports = {
    loadProfile,
    updateProfile,
    updatePassword,
    loadChangeEmail,
    requestEmailOtp,
    verifyEmailOtp,
    loadAddressPage,
    addAddress,
    editAddress,
    deleteAddress

}

