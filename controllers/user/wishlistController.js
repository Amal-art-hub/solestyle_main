import { getWishlistService, addToWishlistService, removeFromWishlistService } from "../../services/userSer/wishlistService.js";
import statusCode from "../../utils/statusCodes.js";

export const loadWishlist = async (req, res) => {
    try {
        const wishlistDoc = await getWishlistService(req.session.user._id);

        res.status(statusCode.OK).render("wishlist", {
            user: req.session.user,
            wishlist: wishlistDoc ? wishlistDoc.products : []
        });
    } catch (error) {
        console.error(error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const { productId, variantId } = req.body;
        await addToWishlistService(req.session.user._id, productId, variantId);
        res.status(statusCode.OK).json({ success: true, message: "Added to wishlist" });
    } catch (error) {
        console.error("Add Error:", error.message);
        if (error.message === "Item already in wishlist") {
            return res.status(statusCode.CONFLICT).json({ success: false, message: error.message });
        }
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        await removeFromWishlistService(req.session.user._id, req.params.id);
        res.status(statusCode.OK).json({ success: true, message: "Removed successfully" });
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
    }
};