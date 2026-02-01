const Order = require("../../models/orders");
// const Wallet = require("../../models/wallet");

const getLedgerData = async ({ period, startDate, endDate, page = 1, limit = 10 }) => {
    try {
        let matchStage = {
            status: { $in: ["delivered", "returned", "canceled"] }
        };

        // const totalCount = await Order.countDocuments(matchStage);
        // const totalPages = Math.ceil(totalCount / limit);
        const now = new Date();
        // Date Filtering Logic
        if (period === 'daily') {
            matchStage.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        } else if (period === 'weekly') {
            matchStage.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        } else if (period === 'monthly') {
            matchStage.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
        } else if (period === 'yearly') {
            matchStage.createdAt = { $gte: new Date(now.getFullYear(), 0, 1) };
        } else if (period === 'custom' && startDate && endDate) {
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

           const statsAggregation=await Order.aggregate([
            {$match:matchStage},
            {
                $group:{
                    _id:null,
                    totalSales:{
                        $sum:{$cond:[{$eq:["$status","delivered"]},"$final_total",0]}
                    },
                    totalRefunds:{
                        $sum:{$cond:[{$in:["$status",["returned","canceled"]]},"$final_total",0]}
                    },
                    count:{$sum:1}
                }
            }
           ]);


                   const stats = statsAggregation.length > 0 ? statsAggregation[0] : { totalSales: 0, totalRefunds: 0, count: 0 };
        const totalCount = stats.count;
        const totalPages = Math.ceil(totalCount / limit);





        const orders = await Order.find(matchStage)
            .populate("user_id", "name email")
            .select("order_number subtotal offer_discount discount_amount final_total status createdAt payment_method")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        const ledger = orders.map(order => {
    const isCredit = order.status === "delivered";
    return {
        date: order.createdAt,
        description: isCredit ? `Sale: ${order.order_number}` : `Refund: ${order.order_number}`,
        userName: order.user_id ? order.user_id.name : 'Unknown User',
        userEmail: order.user_id ? order.user_id.email : 'N/A',
        type: isCredit ? 'credit' : 'debit',
        mrp: order.subtotal,
        offer: order.offer_discount,
        coupon: order.discount_amount,
        amount: order.final_total,
        method: order.payment_method
    };
});
        return { 
            ledger, 
            totalPages, 
            currentPage: parseInt(page), 
            totalCount,
            totalSales: stats.totalSales,   
            totalRefunds: stats.totalRefunds 
        };
    } catch (error) {
        console.error("Ledger Service Error:", error);
        throw error;
    }
}


module.exports = { getLedgerData };
