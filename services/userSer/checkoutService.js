const Cart = require("../../models/cart");
const Address = require("../../models/address");
const Order = require("../../models/orders");
const Variant = require("../../models/varient");
const Product = require("../../models/product");
const Coupon = require("../../models/Coupen"); 



const getCheckoutData = async (userId) => {
    try {
        const cart = await Cart.findOne({ user_id: userId }).populate({
            path: "items.variant_id",
            select: "price stock size color images" 
        }).populate("items.product_id", "name");
        if (!cart || cart.items.length === 0) {
            return { cart: null, addresses: [], subtotal: 0 };
        }
        const addresses = await Address.find({ user_id: userId });
       
        let subtotal = 0;
        cart.items.forEach(item => {
            subtotal += item.quantity * item.price_at_addition;
        });
        return { cart, addresses, subtotal };
    } catch (error) {
        throw error;
    }
};

const placeOrderService=async (userId,addressId,paymentMethod,couponData)=> {
try {

const cart=await Cart.findOne({ user_id: userId }).populate("items.variant_id");
if (!cart|| cart.items.length===0)throw newError("Cart is empty");

const address=await Address.findById(addressId);
if (!address)thrownewError("Address not found");


let totalAmount=0;

const orderItems= [];

for (const item of cart.items) {
const variant= item.variant_id;


if (variant.stock< item.quantity) {
thrownewError(`Stock insufficient for${item.name_snapshot}`);
            }

const itemTotal= item.quantity* item.price_at_addition;
            totalAmount+= itemTotal;

            orderItems.push({
                product_id: item.product_id,
                variant_id: item.variant_id._id,
                quantity: item.quantity,
                unit_price: item.price_at_addition,
                total_amount: itemTotal,
                name_snapshot: item.name_snapshot,
                variant_snapshot:`Size:${variant.size}, Color:${variant.color}`,
                status: 'pending'
            });
        }




        let discountAmount = 0;
  let finalTotal = totalAmount;
      if (couponData) {
        discountAmount = couponData.discount;
        finalTotal = totalAmount - discountAmount;
    }


const orderNumber="ORD-"+ Date.now()+ Math.floor(Math.random()*1000);

const newOrder=new Order({
            user_id: userId,
            status:"pending",
            subtotal: totalAmount,
            discount_amount: discountAmount,
            final_total: finalTotal,
            coupon_id: couponData ? couponData._id : null,
            order_number: orderNumber,
            address_id: addressId,
            shipping_address_snapshot: {
                name: address.name,
                address_line1: address.address_line1,
                address_line2: address.address_line2,
                city: address.city,
                state: address.state,
                postal_code: address.postal_code,
                phone: address.phone,
                alt_phone: address.alt_phone
            },
            payment_method: paymentMethod,
            items: orderItems
        });

await newOrder.save();


for (const item of cart.items) {
await Variant.findByIdAndUpdate(item.variant_id._id, {
                $inc: { stock:-item.quantity }
            });
        }


await Cart.findOneAndDelete({ user_id: userId });

return newOrder;

    }catch (error) {
throw error;
    }
}




const validateCoupon = async (userId, code) => {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    

    if (!coupon) throw new Error("Invalid Coupon Code");
    

    if (new Date() > new Date(coupon.expiry_date)) throw new Error("Coupon Expired");
    

    if (coupon.used_by.includes(userId)) throw new Error("You have already used this coupon");
    

    return coupon;
};





module.exports={
    getCheckoutData,
    placeOrderService,
    validateCoupon
}