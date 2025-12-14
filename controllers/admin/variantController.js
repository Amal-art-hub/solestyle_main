const {
    getVariantsByProduct,
    createVariant,
    updateVariant,
    deleteVariant,
    toggleVariantListing
} = require("../../services/adminSer/variantServices");

const getVariants = async (req, res) => {
    try {
        const { productId } = req.params;
        const { product, variants } = await getVariantsByProduct(productId);

        res.render("varientManag", {
            product,
            variants,
            activePage: "products"
        });
    } catch (error) {
        console.error("Error in getVariants:", error);
        res.status(500).send("Server Error");
    }
};

const getVariantDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const Variant = require('../../models/varient');
        const variant = await Variant.findById(id);

        if (!variant) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }

        res.json({ success: true, variant });
    } catch (error) {
        console.error("Error getting variant details:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const addVariant = async (req, res) => {
    try {
        const { productId } = req.params;

        console.log("Adding variant for product:", productId);
        console.log("Request body:", req.body);
        console.log("Files received:", req.files ? req.files.length : 0);

        // Check if at least 3 images uploaded
        if (!req.files || req.files.length < 3) {
            console.log("Validation failed: Not enough images");
            return res.status(400).json({
                success: false,
                message: "At least 3 images are required"
            });
        }

        await createVariant(productId, req.body, req.files);
        console.log("Variant created successfully");
        res.redirect(`/admin/products/${productId}/variants`);
    } catch (error) {
        console.error("Error adding variant:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
};

const editVariant = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('=== EDIT VARIANT REQUEST ===');
        console.log('Variant ID:', id);
        console.log('Request body:', req.body);
        console.log('Files received:', req.files ? req.files.length : 0);
        console.log('deletedImages field:', req.body.deletedImages);
        console.log('============================');

        const variant = await updateVariant(id, req.body, req.files);

        res.redirect(`/admin/products/${variant.productId}/variants`);
    } catch (error) {
        console.error("Error editing variant:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
};

const toggleVariantStatus = async (req, res) => {
    try {
        const result = await toggleVariantListing(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error toggling variant:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const removeVariant = async (req, res) => {
    try {
        await deleteVariant(req.params.id);
        res.status(200).json({ success: true, message: "Variant deleted" });
    } catch (error) {
        console.error("Error deleting variant:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getVariants,
    getVariantDetails,
    addVariant,
    editVariant,
    toggleVariantStatus,
    removeVariant
};
