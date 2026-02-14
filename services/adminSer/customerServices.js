import User from "../../models/user.js";

export const getCustomerData = async (search, page, limit) => {
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
};

export const blockCustomerById = async (id) => {
    try {
        await User.updateOne({ _id: id }, { $set: { isBlock: true } });
    } catch (error) {
        console.log(error);
    }
};

export const unblockCoustomerById = async (id) => {
    try {
        await User.updateOne({ _id: id }, { $set: { isBlock: false } });
    } catch (error) {
        console.log(error);
    }
};