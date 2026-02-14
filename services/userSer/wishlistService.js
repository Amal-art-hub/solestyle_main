import Wishlist from "../../models/wishlist.js";

export const getWishlistService = async (userId) => {
    return await Wishlist.findOne({ user_id: userId })
        .populate("products.products_id")
        .populate("products.variant_id");
};

export const addToWishlistService = async (userId, productId, variantId) => {
    const wishlist = await Wishlist.findOne({ user_id: userId });

    if (wishlist) {
        const exists = wishlist.products.find(p =>
            p.products_id.toString() === productId &&
            p.variant_id.toString() === variantId
        );
        if (exists) throw new Error("Item already in wishlist");

        wishlist.products.push({ products_id: productId, variant_id: variantId });
        return await wishlist.save();
    } else {
        const newWish = new Wishlist({
            user_id: userId,
            products: [{ products_id: productId, variant_id: variantId }]
        });
        return await newWish.save();
    }
};

export const removeFromWishlistService = async (userId, itemId) => {
    return await Wishlist.updateOne(
        { user_id: userId },
        { $pull: { products: { _id: itemId } } }
    );
};