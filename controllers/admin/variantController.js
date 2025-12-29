const {
    getVariantsByProduct,
    createVariant,
    updateVariant,
    deleteVariant,
    toggleVariantListing
} = require("../../services/adminSer/variantServices");
const statusCode = require("../../utils/statusCodes.js");

const getVariants = async (req, res) => {
    try {
        const { productId } = req.params;
        const page=parseInt(req.query.page)||1;
        const limit=10;
        const { product,variants,currentPage,totalPages } = await getVariantsByProduct(productId,page,limit);

        res.render("varientManag", {
            product,
            variants,
            currentPage,
            totalPages,
            activePage: "products"
        });
    } catch (error) {
        console.error("Error in getVariants:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Server Error");
    }
};

const getVariantDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const Variant = require('../../models/varient');
        const variant = await Variant.findById(id);

        if (!variant) {
            return res.status(statusCode.NOT_FOUND).json({ success: false, message: 'Variant not found' });
        }

        res.json({ success: true, variant });
    } catch (error) {
        console.error("Error getting variant details:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server Error" });
    }
};

const addVariant = async (req, res) => {
    try {
        const { productId } = req.params;

        console.log("Adding variant for product:", productId);
        console.log("Request body:", req.body);
        console.log("Files received:", req.files ? req.files.length : 0);

       
        if (!req.files || req.files.length < 3) {
            console.log("Validation failed: Not enough images");
            return res.status(statusCode.BAD_REQUEST).json({
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
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
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
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
};

const toggleVariantStatus = async (req, res) => {
    try {
        const result = await toggleVariantListing(req.params.id);
        res.status(statusCode.OK).json(result);
    } catch (error) {
        console.error("Error toggling variant:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
    }
};

const removeVariant = async (req, res) => {
    try {
        await deleteVariant(req.params.id);
        res.status(statusCode.OK).json({ success: true, message: "Variant deleted" });
    } catch (error) {
        console.error("Error deleting variant:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
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
