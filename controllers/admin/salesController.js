
const {
    getSalesReport,
     generateExcel,
      generatePDF
} = require("../../services/adminSer/salesService");

const loadReport = async (req, res) => {
    try {
        const { period = 'daily', startDate, endDate } = req.query;
        const data = await getSalesReport({ period, startDate, endDate });
        
        res.render("salesReport", {
            orders: data.orders,
            stats: { 
                count: data.overallSalesCount, 
                amount: data.overallOrderAmount, 
                discount: data.overallDiscount 
            },
            filters: { period, startDate, endDate },
            activePage: 'salesReport' 
        });
    } catch (error) { console.error(error); res.status(500).send("Error"); }
};

const downloadExcel = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;
   
        const data = await getSalesReport({ period, startDate, endDate });
 
        const buffer = await generateExcel(data);

  
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');
        res.send(buffer);
    } catch (error) { console.error(error); res.status(500).send("Excel Error"); }
};

const downloadPDF = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;
     
        const data = await getSalesReport({ period, startDate, endDate });
        const buffer = await generatePDF(data, period || 'Custom');
       

       
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
        res.send(buffer);
    } catch (error) { console.error(error); res.status(500).send("PDF Error"); }
};

module.exports = { loadReport, downloadExcel, downloadPDF };