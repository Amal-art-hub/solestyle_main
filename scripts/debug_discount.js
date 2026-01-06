const mongoose = require("mongoose");
const Product = require("../models/product");
const Offer = require("../models/offers");
const Category = require("../models/category");
require('dotenv').config();

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/Shoe-project";
        console.log(`Connecting to DB (length: ${uri.length})`);
        await mongoose.connect(uri);
        console.log("MongoDB Connected");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();

    console.log("--- Listing First 50 Products ---");
    const products = await Product.find({}).limit(50).populate('categoryId');
    console.log(`Found ${products.length} products total in DB.`);

    let targetProduct = null;
    products.forEach(p => {
        console.log(`Product: "${p.name}", ID: ${p._id}, Category: ${p.categoryId ? p.categoryId.name : 'N/A'}`);
        if (p.name.match(/dunk|low/i)) {
            targetProduct = p;
            console.log("^^^ POTENTIAL MATCH ^^^");
        }
    });

    console.log("\n--- Checking Offers ---");
    const offers = await Offer.find({});
    console.log(`Total Offers: ${offers.length}`);

    offers.forEach(offer => {
        console.log(`Offer: "${offer.name}", Type: ${offer.type}, Value: ${offer.discount_percentage}%, ProductIDs: ${offer.product_ids?.length}, CategoryIDs: ${offer.category_ids?.length}`);

        if (targetProduct) {
            if (offer.type === 'product' && offer.product_ids.map(id => id.toString()).includes(targetProduct._id.toString())) {
                console.log(`!!! MATCHING PRODUCT OFFER FOUND: ${offer.name} !!!`);
            }
            if (offer.type === 'category' && targetProduct.categoryId && offer.category_ids.map(id => id.toString()).includes(targetProduct.categoryId._id.toString())) {
                console.log(`!!! MATCHING CATEGORY OFFER FOUND: ${offer.name} !!!`);
            }
        }
    });

    process.exit(0);
};

run();
