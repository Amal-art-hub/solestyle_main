
const Category = require("../../models/category");
const Cart = require("../../models/cart");
const Wishlist = require("../../models/wishlist");



const loadCategories = async (req, res, next) => {
  try {
    // Fetch categories meant for the header
    const menCategory = await Category.findOne({ name: "Men", isListed: true });
    const womenCategory = await Category.findOne({ name: "Women", isListed: true });
    const kidsCategory = await Category.findOne({ name: "Kids", isListed: true });

    // Store IDs in res.locals (accessible in all EJS views)
    res.locals.menCategoryId = menCategory?._id || "";
    res.locals.womenCategoryId = womenCategory?._id || "";
    res.locals.kidsCategoryId = kidsCategory?._id || "";


    if (req.session.user) {
    const [cart, wishlist] = await Promise.all([
        Cart.findOne({ user_id: req.session.user._id }),
        Wishlist.findOne({ user_id: req.session.user._id })
    ]);
    res.locals.cartCount = cart ? cart.items.length : 0;
    res.locals.wishlistCount = wishlist ? wishlist.products.length : 0;
} else {
    res.locals.cartCount = 0;
    res.locals.wishlistCount = 0;
}

    next();
  } catch (error) {
    console.error("Category Middleware Error:", error);
    next();
  }
};
module.exports = { loadCategories };