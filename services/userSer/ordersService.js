const Order = require("../../models/orders");
const Variant = require("../../models/varient");
const Wallet = require("../../models/wallet"); 

const OrdersListService=async(userId,page,limit,search)=>{
try {
    const query={user_id:userId};

   if (search) {
            query.$or = [
                { order_number: { $regex: search, $options: "i" } },
                { "items.name_snapshot": { $regex: search, $options: "i" } }
            ];
        }

    
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("items.product_id", "name")
            .populate("items.variant_id", "images");


    const count=await Order.countDocuments(query);
    return{
        orders,
        totalPages:Math.ceil(count/limit)

    };
} catch (error) {
    throw error;
    
}
}


module.exports={
    OrdersListService
}