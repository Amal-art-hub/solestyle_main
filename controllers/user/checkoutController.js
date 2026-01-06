
const {
    getCheckoutData,
    placeOrderService,
    validateCoupon
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
             discount: req.session.coupon ? req.session.coupon.discount : 0,
               coupon: req.session.coupon || null
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



const applyCoupen = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.session.user._id;
        const { subtotal } = await getCheckoutData(userId); 

        const coupon = await validateCoupon(userId, code);

       
        if (subtotal < coupon.mincart_value) {
            throw new Error(`Min purchase of ₹${coupon.min_purchase_amount} required`);
        }

   
        let discount = 0;
        if (coupon.discount_type === 'Percentage') {
            discount = (subtotal * coupon.discount_value) / 100;
            // if (discount > coupon.max_discount_amount) discount = coupon.max_discount_amount;
        } else {
            discount = coupon.discount_value;
        }

        
        req.session.coupon = {
            code: coupon.code,
            discount: discount,
            _id: coupon._id
        };

        res.json({ success: true, discount, newTotal: subtotal - discount });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const removeCoupon = async (req, res) => {
    req.session.coupon = null;
    res.json({ success: true });
};




module.exports={
    loadCheckout,
    placeOrder,
    orderSuccess,
    applyCoupen,
    removeCoupon
}