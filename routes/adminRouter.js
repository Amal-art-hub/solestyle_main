import express from "express";
const router = express.Router();
import * as adminController from "../controllers/admin/adminController.js";
import * as customerController from "../controllers/admin/customerController.js";
import * as categoryController from "../controllers/admin/categoryController.js";
import * as brandController from "../controllers/admin/brandController.js";
import * as productController from "../controllers/admin/productController.js";
import * as variantController from "../controllers/admin/variantController.js";
import * as orderController from "../controllers/admin/orderController.js";
import * as offerController from "../controllers/admin/offerController.js";
import * as coupenController from "../controllers/admin/coupenController.js";
import * as salesController from "../controllers/admin/salesController.js";
import * as dashBoardcontroller from "../controllers/admin/dashBoardcontroller.js";
import * as ledgerController from "../controllers/admin/ledgerController.js";

import { upload, variantUpload, bannerUpload, variantCloudUpload } from "../middlewares/admin-mid/multer.js";
import { isAdminLoggedIn } from "../middlewares/admin-mid/admin-auth.js";

router.get("/login", adminController.loadLogin);
router.post("/login", adminController.login);
router.get("/logout", adminController.logout);

router.get("/dashboard", isAdminLoggedIn, dashBoardcontroller.loadDashboard);
router.get("/api/dashboard/chart", isAdminLoggedIn, dashBoardcontroller.getChartDataAPI);

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

router.post("/products/:productId/variants", isAdminLoggedIn, variantCloudUpload.array("images", 10), variantController.addVariant);
router.post("/variants/:id/edit", isAdminLoggedIn, variantCloudUpload.array("newImages", 10), variantController.editVariant);

router.patch("/variants/:id/toggle-listing", isAdminLoggedIn, variantController.toggleVariantStatus);
router.delete("/variants/:id", isAdminLoggedIn, variantController.removeVariant);

//order managment
router.get("/orders", isAdminLoggedIn, orderController.getOrderList);
router.patch("/orders/update-status", isAdminLoggedIn, orderController.changeStatus);
router.get("/orders/details/:id", isAdminLoggedIn, orderController.getOrderDetails);
//admin approve ,reject feature
router.post("/orders/approve-return", isAdminLoggedIn, orderController.approveReturn);
router.post("/orders/reject-return", isAdminLoggedIn, orderController.rejectReturn);

//offer management
router.get("/offers", isAdminLoggedIn, offerController.getOfferList);
router.get("/offers/add", isAdminLoggedIn, offerController.getAddOffer);
router.post("/offers/add", isAdminLoggedIn, offerController.addOffer);

router.get("/offers/edit/:id", isAdminLoggedIn, offerController.getEditOffer);
router.post("/offers/edit/:id", isAdminLoggedIn, offerController.updateOffer);

router.delete("/offers/:id", isAdminLoggedIn, offerController.deleteOffer);

//coupen managment
router.get("/coupons", isAdminLoggedIn, coupenController.getCoupenList);
router.post("/coupons/add", isAdminLoggedIn, coupenController.addCoupon);
router.post("/coupons/edit/:id", isAdminLoggedIn, coupenController.editCoupen);
router.delete("/coupons/:id", isAdminLoggedIn, coupenController.deleteCoupen);

//sales report
router.get("/sales-report", isAdminLoggedIn, salesController.loadReport);
router.get("/sales-report/download/excel", isAdminLoggedIn, salesController.downloadExcel);
router.get("/sales-report/download/pdf", isAdminLoggedIn, salesController.downloadPDF);

router.get("/ledger", isAdminLoggedIn, ledgerController.loadLedger);

export default router;
