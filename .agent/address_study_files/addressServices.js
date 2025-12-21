const Address = require("../../models/address");

// 1. Get All
const getAddressByUserId = async (userId) => {
    return await Address.find({ user_id: userId });
}

// 2. Add New
const createAddress = async (userId, data) => {
    const newAddress = new Address({
        user_id: userId,
        ...data // spread form fields
    });
    return await newAddress.save();
}

// 3. Update
const updateAddress = async (id, data) => {
    return await Address.findByIdAndUpdate(id, data, { new: true });
}

// 4. Delete
const deleteAddress = async (id) => {
    return await Address.findByIdAndDelete(id);
}

module.exports = { getAddressByUserId, createAddress, updateAddress, deleteAddress };
