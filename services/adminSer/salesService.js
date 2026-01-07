
const Order = require("../../models/orders");
const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

const getSalesReport = async ({ period, startDate, endDate }) => {
    try {
        let matchStage = {
            status: "delivered"
        };

        const now = new Date();
        if (period === 'daily') {
        
            matchStage.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        } else if (period === 'weekly') {
        
            matchStage.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        } else if (period === 'yearly') {
       
            matchStage.createdAt = { $gte: new Date(now.getFullYear(), 0, 1) };
        } else if (period === 'custom' && startDate && endDate) {
         
            matchStage.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const pipeline = [
            { $match: matchStage },
            {
                $project: {
                    order_number: 1,
                    final_total: 1,
                    discount_amount: 1,
                    payment_method: 1,
                    status: 1,
                    createdAt: 1
                }
            }
        ];

        const orders = await Order.aggregate(pipeline);
        
        const overallSalesCount = orders.length;
        const overallOrderAmount = orders.reduce((sum, order) => sum + (order.final_total || 0), 0);
        const overallDiscount = orders.reduce((sum, order) => sum + (order.discount_amount || 0), 0);

        return { orders, overallSalesCount, overallOrderAmount, overallDiscount };

    } catch (error) { throw error; }
};


const generateExcel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');
    worksheet.columns = [
        { header: 'Order ID', key: 'order_number', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Payment', key: 'payment_method', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Discount', key: 'discount', width: 15 }, 
        { header: 'Amount', key: 'amount', width: 15 }
    ];
    data.orders.forEach(order => {
        worksheet.addRow({
            order_number: order.order_number,
            date: new Date(order.createdAt).toLocaleDateString(),
            payment_method: order.payment_method,
            status: order.status,
            discount: order.discount_amount || 0,
            amount: order.final_total
        });
    });
    worksheet.addRow({});
    worksheet.addRow({ order_number: 'Total:', amount: data.overallOrderAmount });
  
    return await workbook.xlsx.writeBuffer();
};

const generatePDF = async (data, period) => {
    const templatePath = path.join(__dirname, '../../views/admin/salesReportPDF.ejs');
    

    const html = await ejs.renderFile(templatePath, {
        orders: data.orders,
        stats: { count: data.overallSalesCount, amount: data.overallOrderAmount, discount: data.overallDiscount },
        period
    });

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return pdfBuffer;
};
module.exports = { getSalesReport, generateExcel, generatePDF };