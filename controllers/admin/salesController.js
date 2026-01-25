
const {
    getSalesReport,
    generateExcel,
    generatePDF
} = require("../../services/adminSer/salesService");

const loadReport = async (req, res) => {
    try {


        const { period = 'daily', startDate, endDate, page = 1 } = req.query;
        const data = await getSalesReport({
            period, startDate, endDate, page: parseInt(page),
            limit: 6,isDownload: false
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

        const data = await getSalesReport({ period, startDate, endDate,isDownload: true });

        const buffer = await generateExcel(data);


        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');
        res.send(buffer);
    } catch (error) { console.error(error); res.status(500).send("Excel Error"); }
};

const downloadPDF = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;

        const data = await getSalesReport({ period, startDate, endDate,isDownload: true  });
        const buffer = await generatePDF(data, period || 'Custom');



        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
        res.send(buffer);
    } catch (error) { console.error(error); res.status(500).send("PDF Error"); }
};

module.exports = { loadReport, downloadExcel, downloadPDF };