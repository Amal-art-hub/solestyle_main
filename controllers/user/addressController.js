const addressService = require("../../services/userSer/addressServices");
const statusCode = require("../../utils/statusCodes");

// Validation Function (Provided by User)
const validateAddress = (data) => {
    const { name, phone, postal_code, city, state } = data;
    const errors = {};
    if (!name || name.trim().length < 3) errors.name = "Name is too short";
    if (!/^\d{10}$/.test(phone)) errors.phone = "Invalid Phone Number";
    if (!/^\d{6}$/.test(postal_code)) errors.pincode = "Invalid Pincode";
    if (!city || city.trim().length < 2) errors.city = "City is required";
    return { isValid: Object.keys(errors).length === 0, errors };
}

// 2. Add New Address
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

        await addressService.addAddress(userId, data);

        // Return JSON response for AJAX
        res.status(statusCode.OK).json({ success: true, message: "Address added successfully" });
    } catch (error) {
        console.error("Add Address Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server Error" });
    }
};

// 3. Edit Address
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

        await addressService.editAddress(addressId, userId, data);

        res.status(statusCode.OK).json({ success: true, message: "Address updated successfully" });
    } catch (error) {
        console.error("Edit Address Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server Error" });
    }
};

// 4. Delete Address
const deleteAddress = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const addressId = req.params.id;

        await addressService.deleteAddress(addressId, userId);

        res.status(statusCode.OK).json({ success: true, message: "Address deleted successfully" });
    } catch (error) {
        console.error("Delete Address Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    addAddress,
    editAddress,
    deleteAddress
};
