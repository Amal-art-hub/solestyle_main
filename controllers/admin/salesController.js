
const {
    getSalesReport,
    generateExcel,
    generatePDF
} = require("../../services/adminSer/salesService");

const loadReport = async (req, res) => {
    try {


        const { period = 'daily', startDate, endDate, page = 1 } = req.query;

        const sDate = new Date(startDate);
        const eDate = new Date(endDate);
        const today = new Date();
        // 2. The "Proper" Validation Block
        if (period === 'custom') {
            // Check if dates are valid (not 'ABC' or empty)
            if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
                return res.render("salesReport", {
                    error: "Please provide valid Start and End dates!"
                });
            }
            // Check if Start is after End
            if (sDate > eDate) {
                return res.render("salesReport", {
                    error: "Start Date cannot be after End Date!"
                });
            }
            // Check for Future Dates
            if (sDate > today || eDate > today) {
                return res.render("salesReport", {
                    error: "Dates cannot be in the future!"
                });
            }
        }



        const data = await getSalesReport({
            period, startDate, endDate, page: parseInt(page),
            limit: 6, isDownload: false
        });

        res.render("salesReport", {
            orders: data.orders,
            stats: {
                count: data.overallSalesCount,
                amount: data.overallOrderAmount,
                discount: data.overallDiscount,
                offerDiscount: data.Toffer,
                couponDiscount: data.Tcoupen
            },
            filters: { period, startDate, endDate }, totalPages: data.totalPages,
            currentPage: data.currentPage,
            activePage: 'salesReport'
        });
    } catch (error) { console.error(error); res.status(500).send("Error"); }
};

const downloadExcel = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;

        const data = await getSalesReport({ period, startDate, endDate, isDownload: true });

        const buffer = await generateExcel(data);


        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');
        res.send(buffer);
    } catch (error) { console.error(error); res.status(500).send("Excel Error"); }
};

const downloadPDF = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;

        const data = await getSalesReport({ period, startDate, endDate, isDownload: true });
        const buffer = await generatePDF(data, period || 'Custom');



        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
        res.send(buffer);
    } catch (error) { console.error(error); res.status(500).send("PDF Error"); }
};

module.exports = { loadReport, downloadExcel, downloadPDF };