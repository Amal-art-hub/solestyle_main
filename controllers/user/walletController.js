import {
    getWallet
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