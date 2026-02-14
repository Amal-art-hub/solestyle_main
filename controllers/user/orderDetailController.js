import {
    getOrderDetailsService,
    cancelOrderItemService,
    cancelOrderService,
    returnOrderItemService,
    returnOrderService
} from "../../services/userSer/orderDetailService.js";

import statusCode from "../../utils/statusCodes.js";
import puppeteer from "puppeteer";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.session.user;
        const order = await getOrderDetailsService(orderId, userId);
        res.render("orderDetails", {
            order,
            user: userId,
        });
    } catch (error) {
        console.error("Error fetching order details:", error);
        if (error.message === "Order not found or access denied") {
            return res.status(statusCode.NOT_FOUND).render("page-404");
        }
        res.status(statusCode.INTERNAL_SERVER_ERROR).render("user/500");
    }
};

export const cancelOrderItem = async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { reason } = req.body;

        const result = await cancelOrderItemService(orderId, itemId, reason);
        res.status(statusCode.OK).json(result);
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        const result = await cancelOrderService(orderId, reason);
        res.status(statusCode.OK).json(result);
    } catch (error) {
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
};

export const returnOrderItem = async (req, res) => {
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
};

export const returnOrder = async (req, res) => {
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

export const downloadInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await getOrderDetailsService(orderId, req.session.user);
        // 1. Render the EJS template to HTML string
        const templatePath = path.join(__dirname, "../../views/user/invoiceTemplate.ejs");
        const html = await ejs.renderFile(templatePath, { order });
        // 2. Launch Puppeteer
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

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.order_number}.pdf`);
        res.status(statusCode.OK).send(pdfBuffer);
    } catch (error) {
        console.error("Invoice Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).send("Could not generate invoice");
    }
};