import mongoose from "mongoose";
import Razorpay from "razorpay";
import crypto from "crypto";
import Wallet from "../../models/wallet.js";

export const getWallet = async (userId) => {
    try {
        let wallet = await Wallet.findOne({ user_id: userId });
        if (!wallet) {
            wallet = new Wallet({ user_id: userId });
            await wallet.save();
        }
        return wallet;
    } catch (error) {
        throw new Error("Error fetching wallet", { cause: error });
    }
};

export const creditWallet = async (userId, amount, description) => {
    try {
        let wallet = await getWallet(userId);

        wallet.balance += amount;
        wallet.history.push({
            transaction_id: new mongoose.Types.ObjectId(),
            amount: amount,
            type: "credit",
            description: description,
            date: new Date()
        });
        await wallet.save();
        return wallet;
    } catch (error) {
        console.error("Wallet credit error details:", error);
        throw new Error("Error crediting wallet", { cause: error });
    }
};

export const debitWallet = async (userId, amount, description) => {
    let wallet = await Wallet.findOne({ user_id: userId });

    if (!wallet) {
        wallet = new Wallet({ user_id: userId, balance: 0, transactions: [] });
    }

    wallet.balance += amount;
    wallet.transactions.push({
        amount,
        type: "credit",
        description,
        date: new Date()
    });

    return await wallet.save();
};



export const createWalletTopupOrder = async (amount) => {
    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    return await instance.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: `wallet_topup_${Date.now()}`
    });
};


export const verifyWalletPayment = (order_id, payment_id, signature) => {
    const body = order_id + "|" + payment_id;
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
    return expected === signature;  
};