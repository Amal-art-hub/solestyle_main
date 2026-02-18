import Category from "../../models/category.js";
import Cart from "../../models/cart.js";
import Wishlist from "../../models/wishlist.js";

export const loadLayoutData = async (req, res, next) => {
  try {
    
//  const [menCategory, womenCategory, kidsCategory] = await Promise.all([
//     Category.findOne({ name: "Men", isListed: true }),
//     Category.findOne({ name: "Women", isListed: true }),
//     Category.findOne({ name: "Kids", isListed: true })
// ]);


const allCategories=await Category.find({isListed:true});

res.locals.categories=allCategories;

    res.locals.user = req.session.user || null; 
   
    // res.locals.menCategoryId = menCategory?._id || "";
    // res.locals.womenCategoryId = womenCategory?._id || "";
    // res.locals.kidsCategoryId = kidsCategory?._id || "";


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