const statusCode = require("../../utils/statusCodes");
const {
    getCart,
    addToCartService,
    updateQuantityService,
    removeItemService,
    // removeallItemsService
} = require("../../services/userSer/cartServices");

const loadCartPage = async (req, res) => {
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



const updateCartQty = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { itemId, action } = req.body;

        const result = await updateQuantityService(userId, itemId, action);

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


const removeCartItem = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { itemId } = req.params;

        await removeItemService(userId, itemId);

        res.status(statusCode.OK).json({ success: true, message: "Item removed" });

    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Server Error"
        });
    }
};


// const removeAllItem=async(req,res)=>{
//     try {
//         const user_id=req.session.user._id;
//         await removeallItemsService(user_id);
//         res.status(statusCode.OK).json({success:true,message:"Cart cleared"});

//     } catch (error) {
//         console.error(error);
//         res.status(statusCode.INTERNAL_SERVER_ERROR).json({     success:false,
//             message:"Server Error"})
//     }
// }



module.exports = {
    loadCartPage,
    addToCart,
    updateCartQty,
    removeCartItem,
    // removeAllItem
};