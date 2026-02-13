
const Order = require("../../models/orders");
const ExcelJS = require("exceljs");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");

const getSalesReport = async ({ period, startDate, endDate, page = 1, limit = 6, isDownload = false }) => {
    let matchStage = {
        status: "delivered",


    };




    const now = new Date();
    if (period === "daily") {

        matchStage.createdAt = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
    } else if (period === "weekly") {

        matchStage.createdAt = { $gte: new Date(now.setDate(now.getDate() - 7)) };
    } else if (period === "monthly") {

        matchStage.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };

    } else if (period === "yearly") {

        matchStage.createdAt = { $gte: new Date(now.getFullYear(), 0, 1) };
    } else if (period === "custom" && startDate && endDate) {

        matchStage.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        };
    }


    // final_total:{$gte:10000}
    // payment_method:"COD"

    const pipeline = [
        { $match: matchStage },
        {
            $project: {
                order_number: 1,
                final_total: 1,
                offer_discount: 1,
                discount_amount: 1,
                delivery_charge: 1,
                payment_method: 1,
                subtotal: 1,
                status: 1,
                createdAt: 1
            }
        }
    ];



    //    const pipeline=[
    //     {$match:matchStage},
    //     {
    //         $unwind:"$items"
    //     },
    //     {$group:{
    //         _id:"$items.product_id",
    //         totalQuantity:{$sum:"$items.quantity"},
    //         productName:{
    //             $first:"$items.name_snapshot"
    //         }


    //     }},
    //     {$sort:{totalQuantity:-1}},
    //     {$limit:5}



    // ];






    const allOrders = await Order.aggregate(pipeline);

    const overallSalesCount = allOrders.length;
    const overallOrderAmount = allOrders.reduce((sum, order) => sum + (order.final_total || 0), 0);
    let Toffer = allOrders.reduce((sum, order) => sum + (order.offer_discount || 0), 0);
    let Tcoupen = allOrders.reduce((sum, order) => sum + (order.discount_amount || 0), 0);
    let overallDiscount = Toffer + Tcoupen;



    //      const skip = (page - 1) * limit;
    // const orders = allOrders.slice(skip, skip + limit);

    let orders;
    if (isDownload) {
        orders = allOrders; // Give all records for the report
    } else {
        const skip = (page - 1) * limit;
        orders = allOrders.slice(skip, skip + limit); // Give only 6 for the website
    }
    const totalPages = Math.ceil(overallSalesCount / limit);






    return {
        orders, overallSalesCount, overallOrderAmount, overallDiscount, Toffer, Tcoupen, totalPages,
        currentPage: page
    };
};


const generateExcel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    // 1. Define Columns (Included Total Discount and Delivery Charge)
    worksheet.columns = [
        { header: "Order ID", key: "order_number", width: 25 },
        { header: "Date", key: "date", width: 15 },
        { header: "Payment", key: "payment_method", width: 15 },
        { header: "Status", key: "status", width: 15 },
        { header: "Total MRP", key: "mrp", width: 15 },
        { header: "Offer Given", key: "offer", width: 15 },
        { header: "Coupon Given", key: "coupon", width: 15 },
        { header: "Total Discount", key: "total_discount", width: 15 },
        { header: "Delivery Charge", key: "delivery", width: 15 },
        { header: "Final Amount", key: "amount", width: 15 }
    ];

    // 2. Add Data Rows
    data.orders.forEach(order => {
        const offer = order.offer_discount || 0;
        const coupon = order.discount_amount || 0;
        const delivery = order.delivery_charge || 0;

        worksheet.addRow({
            order_number: order.order_number,
            date: new Date(order.createdAt).toLocaleDateString(),
            payment_method: order.payment_method,
            status: order.status,
            mrp: order.subtotal || 0,
            offer: offer,
            coupon: coupon,
            total_discount: offer + coupon,
            delivery: delivery,
            amount: order.final_total || 0
        });
    });

    // 3. Style the Header Row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" }
    };

    // 4. Add Summary Rows at the bottom
    worksheet.addRow({}); // Empty row

    worksheet.addRow({
        order_number: "SUMMARY TOTALS:",
        amount: data.overallOrderAmount
    }).font = { bold: true };

    worksheet.addRow({
        order_number: "TOTAL REVENUE:",
        amount: data.overallOrderAmount
    });

    worksheet.addRow({
        order_number: "TOTAL OFFER SAVINGS:",
        amount: data.Toffer || 0
    });

    worksheet.addRow({
        order_number: "TOTAL COUPON SAVINGS:",
        amount: data.Tcoupen || 0
    });

    worksheet.addRow({
        order_number: "TOTAL DISCOUNT GIVEN:",
        amount: data.overallDiscount || 0
    });

    return await workbook.xlsx.writeBuffer();
};



// const generateExcel = async (data) => {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('Sales Report');


//     worksheet.columns = [
//         { header: 'Order ID', key: 'order_number', width: 25 },
//         { header: 'Date', key: 'date', width: 15 },
//         { header: 'Payment', key: 'payment_method', width: 15 },
//         { header: 'Status', key: 'status', width: 15 },
//         { header: 'Total MRP', key: 'mrp', width: 15 },     
//         { header: 'Offer Given', key: 'offer', width: 15 },  
//         { header: 'Coupon Given', key: 'coupon', width: 15 }, 
//         { header: 'Total Discount', key: 'total_discount', width: 15 }, 
//         { header: 'Final Amount', key: 'amount', width: 15 }
//     ];


//     data.orders.forEach(order => {
//         worksheet.addRow({
//             order_number: order.order_number,
//             date: new Date(order.createdAt).toLocaleDateString(),
//             payment_method: order.payment_method,
//             status: order.status,
//             mrp: order.subtotal || 0,     
//             offer: order.offer_discount || 0, 
//             coupon: order.discount_amount || 0, 
//         });
//     });


//     worksheet.addRow({}); 
//     worksheet.addRow({ 
//         order_number: 'TOTAL REVENUE:', 
//         amount: data.overallOrderAmount 
//     });
//     worksheet.addRow({ 
//         order_number: 'TOTAL OFFER GIVEN:', 
//         amount: data.Toffer 
//     });
//     worksheet.addRow({ 
//         order_number: 'TOTAL COUPON GIVEN:', 
//         amount: data.Tcoupen 
//     });

//     return await workbook.xlsx.writeBuffer();
// };



const generatePDF = async (data, period) => {
    const templatePath = path.join(__dirname, "../../views/admin/salesReportPDF.ejs");


    const html = await ejs.renderFile(templatePath, {
        orders: data.orders,
        stats: {
            count: data.overallSalesCount,
            amount: data.overallOrderAmount,
            discount: data.overallDiscount,
            offerDiscount: data.Toffer,
            couponDiscount: data.Tcoupen
        },
        period
    });

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-zygote",
            "--disable-gpu"
        ]
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();
    return pdfBuffer;
};



module.exports = {
    getSalesReport,
    generateExcel,
    generatePDF
};