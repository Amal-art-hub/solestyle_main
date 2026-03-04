import {
    getWallet,
    createWalletTopupOrder,
    verifyWalletPayment,
    creditWallet
} from "../../services/userSer/walletService.js";


import statusCode from "../../utils/statusCodes.js";

export const loadWalletPage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const wallet = await getWallet(userId);
        const allHistory = wallet.history ? wallet.history.sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

        const totalTransactions = allHistory.length;
        const totalPages = Math.ceil(totalTransactions / limit);

        const currentTransactions = allHistory.slice(skip, skip + limit);

        res.status(statusCode.OK).render("wallet", {
            user: userId,
            wallet: wallet,
            transactions: currentTransactions,

            // Pagination Data
            currentPage: page,
            totalPages: totalPages,
            pageTitle: "My Wallet"
        });

    } catch (error) {
        console.error("Error loading wallet:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("page-404");
    }
};

export const createTopupOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const order = await createWalletTopupOrder(amount);
        res.status(statusCode.OK).json({
            success: true,
            order,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Topup order error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false, message: "Failed to create order"
        });
    }
};

export const verifyTopupPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
        const userId = req.session.user._id;
        const isValid = verifyWalletPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
        if (!isValid) {
            return res.status(statusCode.BAD_REQUEST).json({ success: false, message: "Payment verification failed" });
        }
        const wallet = await creditWallet(userId, Number(amount), "Wallet Top-up via Razorpay");
        res.status(statusCode.OK).json({
            success: true,
            message: "Wallet topped up!",
            newBalance: wallet.balance.toFixed(2),
            newTransaction: wallet.history[wallet.history.length - 1]
        });
    } catch (error) {
        console.error("Topup verify error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: "Verification failed" });
    }
};