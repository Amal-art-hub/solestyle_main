const Address = require("../../models/address.js");

// 2. Add New Address
const addAddress = async (userId, data) => {
    // Handle Default Shipping Logic
    if (data.is_default_shipping === "true" || data.is_default_shipping === true) {
        await Address.updateMany({ user_id: userId }, { is_default_shipping: false });
    }

    // Handle Default Billing Logic
    if (data.is_default_billing === "true" || data.is_default_billing === true) {
        await Address.updateMany({ user_id: userId }, { is_default_billing: false });
    }

    const newAddress = new Address({
        user_id: userId,
        ...data
    });
    return await newAddress.save();
};

// 3. Edit Address
const editAddress = async (addressId, userId, data) => {
    // Handle Default Shipping Logic
    if (data.is_default_shipping === "true" || data.is_default_shipping === true) {
        await Address.updateMany({ user_id: userId }, { is_default_shipping: false });
    }

    // Handle Default Billing Logic
    if (data.is_default_billing === "true" || data.is_default_billing === true) {
        await Address.updateMany({ user_id: userId }, { is_default_billing: false });
    }

    // Ensure we only edit address belonging to the user
    const updatedAddress = await Address.findOneAndUpdate(
        { _id: addressId, user_id: userId },
        data,
        { new: true }
    );
    return updatedAddress;
};

// 4. Delete Address
const deleteAddress = async (addressId, userId) => {
    return await Address.findOneAndDelete({ _id: addressId, user_id: userId });
};

module.exports = {
    addAddress,
    editAddress,
    deleteAddress
};
