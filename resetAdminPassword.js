const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/admin');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Connection error:', err));

async function resetAdminPassword() {
    try {
        // Find admin by email (change this to your admin email)
        const adminEmail = 'admin@gmail.com'; // ✅ Your admin email
        const newPassword = 'admin123'; // ⚠️ CHANGE THIS to your preferred password

        const admin = await Admin.findOne({ email: adminEmail });

        if (!admin) {
            console.log('❌ Admin not found with email:', adminEmail);
            console.log('\nTip: Run this to see all admin emails:');
            console.log('  const admins = await Admin.find({}, "email");');
            process.exit(1);
        }

        // Update password (will be hashed automatically by pre-save hook)
        admin.password = newPassword;
        await admin.save();

        console.log('✅ Password reset successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log(`New Password: ${newPassword}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetAdminPassword();
