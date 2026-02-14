import Offers from "../../models/offers.js";
import Product from "../../models/product.js";
import Category from "../../models/category.js";

const validateOfferData = (data, isUpdate = false) => {
    if (!data.name || data.name.trim() === "") {
        throw new Error("Offer Name is required");
    }

    const discount = parseInt(data.discount_percentage);
    if (isNaN(discount) || discount < 1 || discount > 99) {
        throw new Error("Discount must be between 1% and 99%");
    }

    if (!data.start_date || !data.end_date) {
        throw new Error("Start Date and End Date are required");
    }
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid dates provided");
    }

    if (!isUpdate && startDate < today) {
        throw new Error("Start Date cannot be in the past");
    }

    if (endDate < startDate) {
        throw new Error("End Date cannot be before Start Date");
    }

    if (data.type === "product") {
        if (!data.product_ids || data.product_ids.length === 0) {
            throw new Error("Please select at least one Product for a Product Offer");
        }
    } else if (data.type === "category") {
        if (!data.category_ids || data.category_ids.length === 0) {
            throw new Error("Please select at least one Category for a Category Offer");
        }
    }
};

export const listOffers = async (page = 1, limit = 10, search = "") => {
    const query = {};
    if (search) {
        query.name = { $regex: new RegExp(search, "i") };
    }

    const offers = await Offers.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const count = await Offers.countDocuments(query);
    return {
        offers,
        totalPages: Math.ceil(count / limit),
        currentPage: page
    };
};

export const getAddOfferService = async () => {
    try {
        const products = await Product.find({ isListed: true }, "name _id");
        const categories = await Category.find({ isListed: true }, "name _id");
        return {
            products,
            categories
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createOfferService = async (data) => {
    validateOfferData(data);

    const startDate = new Date(data.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
        throw new Error("Start Date cannot be in the past");
    }

    if (data.type === "category" || data.type === "product") {
        const isCategory = data.type === "category";
        const targetIds = isCategory ? data.category_ids : data.product_ids;
        const idField = isCategory ? "category_ids" : "product_ids";
        const populateField = isCategory ? "category_ids" : "product_ids";

        const query = {
            type: data.type,
            status: "active",
            [idField]: { $in: targetIds }
        };

        const overlappingOffers = await Offers.find(query).populate(populateField, "name");

        if (overlappingOffers.length > 0) {
            const conflictingNames = [];
            overlappingOffers.forEach(offer => {
                offer[populateField].forEach(item => {
                    if (targetIds.includes(item._id.toString())) {
                        conflictingNames.push(item.name);
                    }
                });
            });
            const uniqueConflicts = [...new Set(conflictingNames)];

            if (!data.override) {
                const error = new Error(`Overlap detected for: ${uniqueConflicts.join(", ")}`);
                error.type = "CONFLICT";
                error.conflicts = uniqueConflicts;
                throw error;
            }

            for (const oldOffer of overlappingOffers) {
                oldOffer[idField] = oldOffer[idField].filter(
                    id => !targetIds.includes(id._id ? id._id.toString() : id.toString())
                );

                if (oldOffer[idField].length === 0) {
                    oldOffer.status = "inactive";
                }

                await oldOffer.save();
            }
        }
    }

    const offer = new Offers(data);
    return await offer.save();
};

export const getOfferById = async (id) => {
    try {
        return await Offers.findById(id);
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateOfferService = async (id, data) => {
    validateOfferData(data, true);

    if (data.type === "category" || data.type === "product") {
        const isCategory = data.type === "category";
        const targetIds = isCategory ? data.category_ids : data.product_ids;
        const idField = isCategory ? "category_ids" : "product_ids";
        const populateField = isCategory ? "category_ids" : "product_ids";

        const query = {
            type: data.type,
            status: "active",
            [idField]: { $in: targetIds }
        };

        const overlappingOffers = await Offers.find(query).populate(populateField, "name");

        if (overlappingOffers.length > 0) {
            const conflictingNames = [];
            overlappingOffers.forEach(offer => {
                offer[populateField].forEach(item => {
                    if (targetIds.includes(item._id.toString())) {
                        conflictingNames.push(item.name);
                    }
                });
            });
            const uniqueConflicts = [...new Set(conflictingNames)];

            if (!data.override) {
                const error = new Error(`Overlap detected for: ${uniqueConflicts.join(", ")}`);
                error.type = "CONFLICT";
                error.conflicts = uniqueConflicts;
                throw error;
            }

            for (const oldOffer of overlappingOffers) {
                oldOffer[idField] = oldOffer[idField].filter(
                    id => !targetIds.includes(id._id ? id._id.toString() : id.toString())
                );

                if (oldOffer[idField].length === 0) {
                    oldOffer.status = "inactive";
                }

                await oldOffer.save();
                console.log("succes in update the earlier one");
            }
        }

        const offer = await Offers.findByIdAndUpdate(id, data, { new: true });
        if (!offer) {
            throw new Error("Offer not found");
        }
        return offer;
    }
};

export const deleteOfferService = async (id) => {
    return await Offers.findByIdAndDelete(id);
};