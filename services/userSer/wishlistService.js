const Wishlist = require("../../models/wishlist");

const getWishlistService = async (userId) => {
    // We populate the 'products' array
    return await Wishlist.findOne({ user_id: userId })
        .populate('products.products_id')
        .populate('products.variant_id');
};

const addToWishlistService = async (userId, productId, variantId) => {
    // 1. Try to find the user's wishlist
    const wishlist = await Wishlist.findOne({ user_id: userId });

    if (wishlist) {
        // 2. Check if item exists manually (double safety)
        const exists = wishlist.products.find(p => 
            p.products_id.toString() === productId && 
            p.variant_id.toString() === variantId
        );
        if (exists) throw new Error("Item already in wishlist");

        // 3. Add to existing list
        wishlist.products.push({ products_id: productId, variant_id: variantId });
        return await wishlist.save();
    } else {
        // 4. Create new list if first time
        const newWish = new Wishlist({
            user_id: userId,
            products: [{ products_id: productId, variant_id: variantId }]
        });
        return await newWish.save();
    }
};

const removeFromWishlistService = async (userId, itemId) => {
    // Remove specific item from the array
    return await Wishlist.updateOne(
        { user_id: userId },
        { $pull: { products: { _id: itemId } } }
    );
};

module.exports = {
    getWishlistService,
    addToWishlistService,
    removeFromWishlistService
};