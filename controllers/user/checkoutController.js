
const {
    getCheckoutData,
    placeOrderService
} = require("../../services/userSer/checkoutService");
const statusCode = require("../../utils/statusCodes");


const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { cart, addresses, subtotal } = await getCheckoutData(userId);
         if (!cart) {
            return res.redirect("/user/cart"); 
        }
        res.render("checkout", {
            user: req.session.user,
            cart: cart,
            addresses: addresses,
            subtotal: subtotal,
             discount: 0 
        });
    } catch (error) {
        console.error("Load Checkout Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
    }
};



const placeOrder=async (req,res)=> {
try {
const userId= req.session.user._id;
const { addressId, paymentMethod }= req.body;

if (!addressId) {
return res.status(statusCode.BAD_REQUEST).json({ success:false, message:"Please select an address" });
        }

const order=await placeOrderService(userId, addressId, paymentMethod);

        res.status(statusCode.OK).json({
            success:true,
            message:"Order placed successfully",
            orderId: order._id
        });

    }catch (error) {
        console.error("Place Order Error:", error);
        res.status(statusCode.BAD_REQUEST).json({
            success:false,
            message: error.message||"Failed to place order"
        });
    }
};

const orderSuccess=async (req,res)=> {
try {
const orderId= req.params.id;
        res.render("orderSuccess", {
            user: req.session.user,
            orderId: orderId
        });
    }catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
    }
};

module.exports={
    loadCheckout,
    placeOrder,
    orderSuccess
}