const User = require("../../models/user");

const getCustomerData = async (search, page, limit) => {
    try {
        const query = {
            $or: [
                { name: { $regex: ".*" + search + ".*", $options: "i" } },
                { email: { $regex: ".*" + search + ".*", $options: "i" } },
            ]
        };
        const userData = await User.find(query).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
        const count = await User.find(query).countDocuments();

        return {
            userData,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        };


    } catch (error) {
        throw error;
    }
}

module.exports = {
    getCustomerData
}