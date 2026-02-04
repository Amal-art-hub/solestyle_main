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

/* --- UPDATED STRICT VALIDATION --- */
const fileFilter = (req, file, cb) => {
  // 1. Define the allowed extensions (regex)
  const allowedExtensions = /jpeg|jpg|png|webp|gif/;
  
  // 2. Check the file extension
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  // 3. Check the MIME type
  const mimetype = allowedExtensions.test(file.mimetype);

  if (extname && mimetype) {
    // If both are true, it's a valid image
    cb(null, true);
  } else {
    // This is where PDFs or renamed files will be caught
    cb(new Error("Error: Only images (JPG, PNG, WEBP) are allowed!"), false);
  }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const variantUpload = multer({ 
    storage: variantStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { upload, variantUpload };