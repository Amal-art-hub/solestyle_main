const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categoryController = require("../controllers/admin/categoryController");
const brandController = require("../controllers/admin/brandController");
const { isAdminLoggedIn } = require("../middlewares/admin-mid/admin-auth")

router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/logout", adminController.logout)



router.get("/dashboard", isAdminLoggedIn, adminController.loadDashboard);
router.get("/users", isAdminLoggedIn, customerController.getCustomers);
router.get("/unblockCustomer", isAdminLoggedIn, customerController.unblockCoustomer);
router.get("/blockCustomer", isAdminLoggedIn, customerController.blockCustomer);



router.get("/Category", isAdminLoggedIn, categoryController.categoryInfo);
router.post("/addCategory", isAdminLoggedIn, categoryController.addCategory);
router.post("/editCategory", isAdminLoggedIn, categoryController.editCategory);
router.get("/listCategory", isAdminLoggedIn, categoryController.getListStatus);


router.get("/Brands", isAdminLoggedIn, brandController.getBrandPage);
router.post("/addBrand", isAdminLoggedIn, brandController.addBrand);
router.post("/editBrand", isAdminLoggedIn, brandController.editBrand);
router.get("/blockBrand", isAdminLoggedIn, brandController.blockBrand);



module.exports = router;
