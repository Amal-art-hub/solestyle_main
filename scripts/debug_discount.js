import mongoose from "mongoose";
import Product from "../models/product.js";
import Offer from "../models/offers.js";
import Category from "../models/category.js";
import 'dotenv/config';

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected");

        const products = await Product.find();
        console.log(`Found ${products.length} products`);

        const offers = await Offer.find();
        console.log(`Found ${offers.length} offers`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
