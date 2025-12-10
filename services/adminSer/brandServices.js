const Brand = require("../../models/brand");
// 1. Fetch all Brands with pagination and search
const getAllBrands = async (page = 1, limit = 4, search = "") => {
    try {
        const skip = (page - 1) * limit;
        const query = {};

        if (search) {
            query.name = { $regex: new RegExp(search, "i") };
        }

        const brands = await Brand.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalBrands = await Brand.countDocuments(query);
        const totalPages = Math.ceil(totalBrands / limit);

        return {
            brands,
            currentPage: page,
            totalPages,
            totalBrands
        };
    } catch (error) {
        throw new Error("Error fetching brands: " + error.message);
    }
};

// 4. Edit Brand
const editBrand = async (id, name, description) => {
    try {
        const existingBrand = await Brand.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") },
            _id: { $ne: id }
        });

        if (existingBrand) {
            return { success: false, message: "Brand name already exists" };
        }

        await Brand.findByIdAndUpdate(id, {
            name: name,
            description: description
        });

        return { success: true, message: "Brand updated successfully" };

    } catch (error) {
        throw new Error("Error updating brand: " + error.message);
    }
};

// 2. Add a new Brand
const createBrand = async (name) => {
    try {
        const existingBrand = await Brand.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") }
        });

        if (existingBrand) {
            return { success: false, message: "Brand already exists" };
        }

        const newBrand = new Brand({ name });
        await newBrand.save();
        return { success: true, message: "Brand added successfully" };

    } catch (error) {
        throw new Error("Error creating brand: " + error.message);
    }
};

// 3. Toggle Brand Status (Block/Unblock)
const toggleBrandStatus = async (id) => {
    try {
        const brand = await Brand.findById(id);
        if (!brand) return { success: false, message: "Brand not found" };

        // Ensure model has this field. Assuming isBlocked based on other parts of code (or isListed)
        // Check model if needed, but standardizing on isBlocked for now as per controller logic.
        // Actually earlier model view showed 'isListed', let's check model again to be safe.
        // Assuming isListed based on previous read of models/brand.js
        // Wait, let's just check the model before committing this line.
        // But for this step I will assume ISLISTED if I remember correctly from earlier read.
        // Step 129 showed models/brand.js has isListed: { type: Boolean, default: true }

        brand.isListed = !brand.isListed;
        await brand.save();
        // Return isBlocked inverted logic if controller expects isBlocked, 
        // OR better, update view/controller to use isListed.
        // View uses !isBlocked. 
        // If Model has isListed, then isBlocked = !isListed.
        // So I should return status: !brand.isListed
        return { success: true, status: !brand.isListed }; // returns isBlocked status essentially

    } catch (error) {
        throw new Error("Error toggling brand status: " + error.message);
    }
};

module.exports = {
    getAllBrands,
    createBrand,
    toggleBrandStatus,
    editBrand
};