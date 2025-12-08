const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const { isAdminLoggedIn } = require("../middlewares/admin-mid/admin-auth")

router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/logout", adminController.logout)

router.get("/dashboard", isAdminLoggedIn, adminController.loadDashboard);
router.get("/users", isAdminLoggedIn, customerController.getCustomers);
router.get("/unblockCustomer", isAdminLoggedIn, customerController.unblockCoustomer);
router.get("/blockCustomer", isAdminLoggedIn, customerController.blockCustomer);


module.exports = router;
