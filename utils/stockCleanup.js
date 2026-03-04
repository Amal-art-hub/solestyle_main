import nodeCron from "node-cron";
import Order from "../models/orders.js";
import Variant from "../models/varient.js";

const startStockCleanupJob = () => {
    // Run every 10 minutes
    nodeCron.schedule("*/10 * * * *", async () => {
        try {
            console.log("--- Running Background Stock Cleanup Job ---");

            const bufferTime = new Date(Date.now() - 15 * 60 * 1000);

            const abandonedOrders = await Order.find({
                status: "Payment Pending",
                createdAt: { $lt: bufferTime }
            });

            if (abandonedOrders.length === 0) {
                console.log("No abandoned orders found.");
                return;
            }

            for (const order of abandonedOrders) {
                console.log(`Releasing stock for abandoned order: ${order.order_number}`);

                for (const item of order.items) {
                    await Variant.findByIdAndUpdate(item.variant_id, {
                        $inc: { stock: item.quantity }
                    });
                }

                order.status = "Payment Failed";
                await order.save();
            }
            console.log(`Successfully cleared ${abandonedOrders.length} abandoned orders.`);
        } catch (error) {
            console.error("CRITICAL: Stock Cleanup Job Error:", error);
        }
    });
};

export default startStockCleanupJob;
