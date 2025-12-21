const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/user-mid/user-auth"); // Adjust path as needed
const addressController = require("../../controllers/user/addressController");

// ==========================================
// ADDRESS MANAGEMENT ROUTES
// ==========================================

// 1. View Address Page
router.get("/profile/addresses", auth.checkSession, addressController.loadAddressPage);

// 2. Add New Address
router.post("/profile/addresses/add", auth.checkSession, addressController.addAddress);

// 3. Edit Address
router.put("/profile/addresses/edit/:id", auth.checkSession, addressController.editAddress);

// 4. Delete Address
router.delete("/profile/addresses/delete/:id", auth.checkSession, addressController.deleteAddress);

// Export router (if this was a standalone file, but usually you copy these lines into your existing router)
// module.exports = router;
