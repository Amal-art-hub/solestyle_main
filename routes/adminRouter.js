const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categoryController = require("../controllers/admin/categoryController");
const brandController = require("../controllers/admin/brandController");
const productController = require("../controllers/admin/productController");
const variantController = require("../controllers/admin/variantController");
const orderController=require("../controllers/admin/orderController");
const offerController=require("../controllers/admin/offerController");
const coupenController=require("../controllers/admin/coupenController");
const salesController=require("../controllers/admin/salesController");
const { upload, variantUpload } = require("../middlewares/admin-mid/multer");
const { isAdminLoggedIn } = require("../middlewares/admin-mid/admin-auth");



router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/logout", adminController.logout)



router.get("/dashboard", isAdminLoggedIn, adminController.loadDashboard);
router.get("/users", isAdminLoggedIn, customerController.getCustomers);
router.patch("/unblockCustomer", isAdminLoggedIn, customerController.unblockCoustomer);
router.patch("/blockCustomer", isAdminLoggedIn, customerController.blockCustomer);



router.get("/Category", isAdminLoggedIn, categoryController.categoryInfo);
router.post("/addCategory", isAdminLoggedIn, categoryController.addCategory);
router.post("/editCategory", isAdminLoggedIn, categoryController.editCategory);
router.patch("/listCategory", isAdminLoggedIn, categoryController.getListStatus);


router.get("/Brands", isAdminLoggedIn, brandController.getBrandPage);
router.post("/addBrand", isAdminLoggedIn, brandController.addBrand);
router.post("/editBrand", isAdminLoggedIn, brandController.editBrand);
router.patch("/blockBrand", isAdminLoggedIn, brandController.blockBrand);


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



//order managment

router.get("/orders",isAdminLoggedIn,orderController.getOrderList);
router.patch("/orders/update-status",isAdminLoggedIn,orderController.changeStatus);
router.get('/orders/details/:id', isAdminLoggedIn, orderController.getOrderDetails);
//admin approve ,reject feature
router.post("/orders/approve-return",isAdminLoggedIn,orderController.approveReturn);
router.post("/orders/reject-return", isAdminLoggedIn, orderController.rejectReturn);



//offer management

router.get("/offers",isAdminLoggedIn,offerController.getOfferList);
router.get("/offers/add",isAdminLoggedIn,offerController.getAddOffer);
router.post("/offers/add", isAdminLoggedIn, offerController.addOffer);


router.get("/offers/edit/:id",isAdminLoggedIn,offerController.getEditOffer);
router.post("/offers/edit/:id",isAdminLoggedIn,offerController.updateOffer);

router.delete("/offers/:id",isAdminLoggedIn,offerController.deleteOffer);



//coupen managment
router.get("/coupons",isAdminLoggedIn,coupenController.getCoupenList);
router.post("/coupons/add",isAdminLoggedIn,coupenController.addCoupon);
router.post("/coupons/edit/:id",isAdminLoggedIn,coupenController.editCoupen);
router.delete("/coupons/:id",isAdminLoggedIn,coupenController.deleteCoupen);





//sales report
router.get("/sales-report",isAdminLoggedIn,salesController.loadReport); 
router.get("/sales-report/download/excel", isAdminLoggedIn, salesController.downloadExcel);
router.get("/sales-report/download/pdf", isAdminLoggedIn, salesController.downloadPDF); 




module.exports = router;
