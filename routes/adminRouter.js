const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categoryController = require("../controllers/admin/categoryController");
const brandController = require("../controllers/admin/brandController");
const productController = require("../controllers/admin/productController");
const variantController = require("../controllers/admin/variantController");
const { upload, variantUpload } = require("../middlewares/admin-mid/multer");
const { isAdminLoggedIn } = require("../middlewares/admin-mid/admin-auth");



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


//product management

router.get("/products", isAdminLoggedIn, productController.getProductList);
router.patch("/products/toggle-listing", isAdminLoggedIn, productController.toggleListing);
router.get("/products/add", isAdminLoggedIn, productController.getAddProduct);
router.post("/products/add", isAdminLoggedIn, productController.addProducts);
router.get("/products/edit/:id", isAdminLoggedIn, productController.getEditProduct);
router.post("/products/edit/:id", isAdminLoggedIn, productController.updateProduct);

// Variant management
router.get("/products/:productId/variants", isAdminLoggedIn, variantController.getVariants);
router.get("/variants/:id/details", isAdminLoggedIn, variantController.getVariantDetails);
router.post("/products/:productId/variants", isAdminLoggedIn, variantUpload.array("images", 10), variantController.addVariant);
router.post("/variants/:id/edit", isAdminLoggedIn, variantUpload.array("newImages", 10), variantController.editVariant);
router.patch("/variants/:id/toggle-listing", isAdminLoggedIn, variantController.toggleVariantStatus);
router.delete("/variants/:id", isAdminLoggedIn, variantController.removeVariant);




module.exports = router;
