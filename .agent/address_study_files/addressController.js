const addressServices = require("../../services/userSer/addressServices");

// Validation Helper
const validateAddress = (data) => {
    const { name, phone, postal_code, city, state } = data;
    const errors = {};
    if (!name || name.trim().length < 3) errors.name = "Name is too short";
    if (!/^\d{10}$/.test(phone)) errors.phone = "Invalid Phone Number";
    if (!/^\d{6}$/.test(postal_code)) errors.pincode = "Invalid Pincode";
    if (!city || city.trim().length < 2) errors.city = "City is required";
    return { isValid: Object.keys(errors).length === 0, errors };
}

// 1. Load Page
const loadAddressPage = async (req, res) => {
    try {
        const addresses = await addressServices.getAddressByUserId(req.session.user._id);
        res.render("user/addresses", { addresses, user: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).render("page-500");
    }
}

// 2. Add Address
const addAddress = async (req, res) => {
    try {
        const validation = validateAddress(req.body);
        if (!validation.isValid) {
            return res.json({ success: false, message: "Validation Failed", errors: validation.errors });
        }
        await addressServices.createAddress(req.session.user._id, req.body);
        res.json({ success: true, message: "Address added successfully" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server Error" });
    }
}

// 3. Edit Address
const editAddress = async (req, res) => {
    try {
        await addressServices.updateAddress(req.params.id, req.body);
        res.json({ success: true, message: "Address updated" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server Error" });
    }
}

// 4. Delete Address
const deleteAddress = async (req, res) => {
    try {
        await addressServices.deleteAddress(req.params.id);
        res.json({ success: true, message: "Address deleted" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server Error" });
    }
}

module.exports = { loadAddressPage, addAddress, editAddress, deleteAddress };
