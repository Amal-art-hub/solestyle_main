const {
    getOrderDetailsService,
    cancelOrderItemService,
    cancelOrderService,
    returnOrderItemService
} = require("../../services/userSer/orderDetailService");


const statusCode = require("../../utils/statusCodes");
const PDFDocument = require('pdfkit');                
const fs = require('fs');                             
const path = require('path');


const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.session.user;
        const order = await getOrderDetailsService(orderId, userId);
        res.render("orderDetails", {
            order,
            user: userId
        });
    } catch (error) {
        console.error("Error fetching order details:", error);
        if (error.message === "Order not found or access denied") {
            return res.status(404).render("user/404");
        }
        res.status(500).render("user/500");
    }
};

const cancelOrderItem = async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { reason } = req.body;

        const result = await cancelOrderItemService(orderId, itemId, reason);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        const result = await cancelOrderService(orderId, reason);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const returnOrderItem = async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { reason } = req.body;

        const result = await returnOrderItemService(orderId, itemId, reason);
        res.status(statusCode.OK).json(result);
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }


}

module.exports = {
    getOrderDetails,
    cancelOrderItem,
    cancelOrder,
    returnOrderItem
};

const returnOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;
        const result = await returnOrderService(orderId, reason);
        res.status(statusCode.OK).json(result);
    } catch (error) {
        console.error("RETURN ORDER ERROR:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};



const downloadInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await getOrderDetailsService(orderId, req.session.user);
        const doc = new PDFDocument({ margin: 50 });


        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.order_number}.pdf`);
        doc.pipe(res);

        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Order ID: ${order.order_number}`);
        doc.text(`Date: ${new Date(order.order_date).toLocaleDateString()}`);
        doc.text(`Status: ${order.status}`);
        doc.moveDown();

        doc.text(`Bill To: ${order.shipping_address_snapshot.name}`);
        doc.text(order.shipping_address_snapshot.address_line1);
        doc.text(`${order.shipping_address_snapshot.city}, ${order.shipping_address_snapshot.state} - ${order.shipping_address_snapshot.postal_code}`);
        doc.moveDown();

        let y = doc.y;
        doc.text('Item', 50, y, { width: 250 });
        doc.text('Qty', 300, y, { width: 50, align: 'center' });
        doc.text('Price', 350, y, { width: 100, align: 'right' });
        doc.text('Total', 450, y, { width: 100, align: 'right' });
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        doc.moveDown();

        order.items.forEach(item => {
            if (item.status !== 'canceled') {
                let y = doc.y;
                doc.text(item.name_snapshot, 50, y, { width: 250 });
                doc.text(item.quantity, 300, y, { width: 50, align: 'center' });
                doc.text(item.unit_price, 350, y, { width: 100, align: 'right' });
                doc.text(item.total_amount, 450, y, { width: 100, align: 'right' });
                doc.moveDown();
            }
        });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        doc.fontSize(14).text(`Grand Total: Rs. ${order.final_total}`, { align: 'right' });
        doc.end();
    } catch (error) {
        console.error("Invoice Error:", error);
        res.status(500).send("Could not generate invoice");
    }
};

module.exports = {
    getOrderDetails,
    cancelOrderItem,
    cancelOrder,
    returnOrderItem,
    returnOrder,
    downloadInvoice
};