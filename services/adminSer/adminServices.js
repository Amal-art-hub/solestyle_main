const Admin = require("../../models/admin.js");
const bcrypt = require("bcrypt");

async function loginAdmin(email, password) {
    try {
        if (!email || !password) throw new Error("Email and password are required");

        console.log('Attempting login for email:', email);

        const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
        if (!admin) throw new Error("Invalid email or password");

        console.log('Admin found, comparing passwords...');
        const passwordMatch = await bcrypt.compare(password.trim(), admin.password);
        if (!passwordMatch) throw new Error("Invalid email or password");

        console.log('Password comparison successful');
        const { password: _, ...adminData } = admin.toObject();
        return { success: true, admin: adminData };

    } catch (error) {
        console.error("login service error:", error);
        return { success: false, message: error.message || "An error occurred during login." };
    }
}

module.exports = { loginAdmin };
