const statusCode = require("../../utils/statusCodes");
const {
    getCart,
    addToCartService,
    updateQuantityService,
    removeItemService
} = require("../../services/userSer/cartServices");

const loadCartPage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const cart = await getCart(userId);


        res.render("cart", {
            cart: cart,
            user: req.session.user
        });
    } catch (error) {
        console.error("Load Cart Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
    }
};




// const loadCheckout = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const { cart, addresses, subtotal } = await getCheckoutData(userId);
//           const wallet = await getWallet(userId);
//          if (!cart) {
//             return res.redirect("/user/cart"); 
//         }
      
//         res.render("checkout", {
//             user: req.session.user,
//             cart: cart,
//             addresses: addresses,
//             subtotal: subtotal,
//              discount: req.session.coupon ? req.session.coupon.discount : 0,
//                coupon: req.session.coupon || null,
//                 wallet: wallet 
//         });
//     } catch (error) {
//         console.error("Load Checkout Error:", error);
//         res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
//     }
// };

const addToCart = async (req, res) => {
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



const updateCartQty=async (req,res)=> {
try {
const userId= req.session.user._id;
const { itemId, action }= req.body;

const result = await updateQuantityService(userId, itemId, action);

        res.status(statusCode.OK).json({ success:true, 
            message:"Quantity updated",
         newQty: result.newQty,
        cartTotal: result.optTotal  });

    }catch (error) {
        res.status(statusCode.BAD_REQUEST).json({
            success:false,
            message: error.message
        });
    }
};


const removeCartItem=async (req,res)=> {
try {
const userId= req.session.user._id;
const { itemId }= req.params;

await removeItemService(userId, itemId);

        res.status(statusCode.OK).json({ success:true, message:"Item removed" });

    }catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success:false,
            message:"Server Error"
        });
    }
};



module.exports = {
    loadCartPage,
    addToCart,
    updateCartQty,
    removeCartItem
};