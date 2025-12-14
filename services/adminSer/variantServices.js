const Variant = require("../../models/varient");
const Product = require("../../models/product");

const getVariantsByProduct = async (productId) => {
    try {
        const product = await Product.findById(productId)
            .populate("categoryId", "name")
            .populate("brandId", "name");

        if (!product) {
            throw new Error("Product not found");
        }

        const variants = await Variant.find({ productId }).sort({ createdAt: -1 });

        return { product, variants };
    } catch (error) {
        throw new Error("Error fetching variants: " + error.message);
    }
};

const createVariant = async (productId, data, files) => {
    try {
        const { size, color, price, stock } = data;

        // Map uploaded files to filenames
        const images = files.map(file => file.filename);

        const newVariant = new Variant({
            productId,
            size,
            color,
            price,
            stock,
            images
        });

        await newVariant.save();
        return newVariant;
    } catch (error) {
        throw new Error("Error creating variant: " + error.message);
    }
};

const updateVariant = async (id, data, files) => {
    try {
        const variant = await Variant.findById(id);
        if (!variant) {
            throw new Error("Variant not found");
        }

        variant.size = data.size;
        variant.color = data.color;
        variant.price = data.price;
        variant.stock = data.stock;

        // Start with current images
        let currentImages = [...variant.images];

        // Handle image deletions
        if (data.deletedImages) {
            try {
                const deletedImages = JSON.parse(data.deletedImages);
                // Remove deleted images
                currentImages = currentImages.filter(img => !deletedImages.includes(img));
                console.log('After deletion:', currentImages.length, 'images remaining');
            } catch (e) {
                console.error('Error parsing deletedImages:', e);
            }
        }

        // Add new images if uploaded
        if (files && files.length > 0) {
            const newImages = files.map(file => file.filename);
            currentImages = [...currentImages, ...newImages];
            console.log('After adding new images:', currentImages.length, 'total images');
        }

        // Validate image count
        if (currentImages.length < 3 || currentImages.length > 10) {
            throw new Error(`Variant must have between 3 and 10 images. Currently: ${currentImages.length}`);
        }

        variant.images = currentImages;
        await variant.save();
        return variant;
    } catch (error) {
        throw new Error("Error updating variant: " + error.message);
    }
};

const toggleVariantListing = async (id) => {
    try {
        const variant = await Variant.findById(id);
        if (!variant) {
            return { success: false, message: "Variant not found" };
        }

        variant.isListed = !variant.isListed;
        await variant.save();

        return {
            success: true,
            isListed: variant.isListed,
            message: variant.isListed ? "Variant listed" : "Variant unlisted"
        };
    } catch (error) {
        throw new Error("Error toggling variant: " + error.message);
    }
};

const deleteVariant = async (id) => {
    try {
        await Variant.findByIdAndDelete(id);
        return { success: true };
    } catch (error) {
        throw new Error("Error deleting variant: " + error.message);
    }
};

module.exports = {
    getVariantsByProduct,
    createVariant,
    updateVariant,
    toggleVariantListing,
    deleteVariant
};
