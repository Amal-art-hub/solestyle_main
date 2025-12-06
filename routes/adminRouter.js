const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const {isAdminLoggedIn}=require("../middlewares/admin-mid/admin-auth")

router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);

router.get("/dashboard",isAdminLoggedIn,adminController.loadDashboard);


module.exports = router;
