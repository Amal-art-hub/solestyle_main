const multer = require("multer");
const path = require("path");
// Product images storage (keep existing)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/product-images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
// Variant images storage (NEW)
const variantStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/variant-images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } 
});
const variantUpload = multer({ 
    storage: variantStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});
module.exports = { upload, variantUpload };