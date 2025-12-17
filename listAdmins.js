const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/admin');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));

async function listAdmins() {
    try {
        const admins = await Admin.find({}, 'email createdAt');

        if (admins.length === 0) {
            console.log('❌ No admin accounts found in database');
            console.log('\nCreate a new admin with:');
            console.log('  node createAdmin.js');
        } else {
            console.log(`✅ Found ${admins.length} admin account(s):\n`);
            admins.forEach((admin, index) => {
                console.log(`${index + 1}. Email: ${admin.email}`);
                console.log(`   Created: ${admin.createdAt}\n`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listAdmins();
