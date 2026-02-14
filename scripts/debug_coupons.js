import mongoose from "mongoose";
import Coupon from "../models/Coupen.js";
import fs from "fs";
import 'dotenv/config';

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected");

        const coupons = await Coupon.find();
        console.log(`Found ${coupons.length} coupons`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
