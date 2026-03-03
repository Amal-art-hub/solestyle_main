import statusCode from "../../utils/statusCodes.js";
import Cart from "../../models/cart.js";
import {
    getCart,
    addToCartService,
    updateQuantityService,
    removeItemService,
} from "../../services/userSer/cartServices.js";

export const loadCartPage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const cart = await getCart(userId);

        res.status(statusCode.OK).render("cart", {
            cart: cart,
            user: req.session.user,
        });
    } catch (error) {
        console.error("Load Cart Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
    }
};

export const addToCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { variantId, quantity } = req.body;
        await addToCartService(userId, variantId, quantity);
        res.status(statusCode.OK).json({
            success: true,
            message: "Product added to cart successfully"
        });
    } catch (error) {
        console.error("Add Cart Error:", error.message);

        res.status(statusCode.BAD_REQUEST).json({
            success: false,
            message: error.message || "Failed to add to cart"
        });
    }
};

export const updateCartQty = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { itemId, action } = req.body;

        const result = await updateQuantityService(userId, itemId, action);

        if (req.session.coupon && result.optTotal < req.session.coupon.mincart_value) {
            req.session.coupon = null;
        }

        res.status(statusCode.OK).json({
            success: true,
            message: "Quantity updated",
            newQty: result.newQty,
            cartTotal: result.optTotal,
            totalSavings: result.totalSavings
        });

    } catch (error) {
        res.status(statusCode.BAD_REQUEST).json({
            success: false,
            message: error.message
        });
    }
};

export const removeCartItem = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { itemId } = req.params;

        await removeItemService(userId, itemId);

        const updatedCart = await Cart.findOne({ user_id: userId }).populate("items.variant_id");

        const newTotal = updatedCart ? updatedCart.items.reduce((sum, item) => sum + (item.quantity * item.variant_id.price), 0) : 0;

        if (req.session.coupon && newTotal < req.session.coupon.mincart_value) {
            req.session.coupon = null;
        }

        res.status(statusCode.OK).json({ success: true, message: "Item removed" });

    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Server Error"
        });
    }
};