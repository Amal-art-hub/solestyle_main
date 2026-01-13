const mongoose = require('mongoose');
const Coupon = require('../models/Coupen');
const fs = require('fs');
require('dotenv').config();

async function debugCoupons() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Shoe-project');

        const coupons = await Coupon.find({});
        let output = `Found ${coupons.length} coupons.\n`;

        coupons.forEach((c, index) => {
            output += `\n--- Coupon #${index + 1} ---\n`;
            output += `Code: "${c.code}"\n`;
            output += `Type: ${c.discount_type}\n`;
            output += `Value: ${c.discount_value} (Type: ${typeof c.discount_value})\n`;
            output += `Min Cart: ${c.mincart_value} (Type: ${typeof c.mincart_value})\n`;
            output += `Expiry: ${c.expiry_date}\n`;

            if (!c.discount_value) output += '⚠️ WARNING: discount_value is FALSY\n';
            if (c.discount_value === 0) output += '⚠️ INFO: discount_value is explicitly 0\n';
            if (isNaN(c.discount_value)) output += '⚠️ ERROR: discount_value is NaN\n';
        });

        fs.writeFileSync('debug_output.txt', output);
        console.log('Written to debug_output.txt');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugCoupons();
