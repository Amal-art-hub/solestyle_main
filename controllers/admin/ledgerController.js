import { getLedgerData } from "../../services/adminSer/ledgerService.js";
import statusCode from "../../utils/statusCodes.js";

export const loadLedger = async (req, res) => {
    try {
        // Extract page and limit from query parameters
        const { period = "daily", startDate, endDate, page = 1, limit = 10 } = req.query;

        // Destructure the paginated response
        const { ledger, totalPages, currentPage, totalCount, totalSales, totalRefunds } = await getLedgerData({
            period,
            startDate,
            endDate,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.status(statusCode.OK).render("ledger", {
            ledger,
            totalSales,
            totalRefunds,
            netBalance: totalSales - totalRefunds,
            filters: { period, startDate, endDate },

            currentPage,
            totalPages,
            totalCount,
            // FIX: Convert the query object to a string
            // We also filter out 'page' so we don't get double page params in the URL
            query: new URLSearchParams(
                Object.entries(req.query).filter(([key]) => key !== "page")
            ).toString(),

            activePage: "ledger"
        });
    } catch (error) {
        console.error("Load Ledger Controller Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Ledger Error");
    }
};