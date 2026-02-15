import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. KEEP EXISTING: Local Storage for Products
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/product-images"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

// 3. KEEP EXISTING: Local Storage for Variants
const variantStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/variant-images"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

// 4. NEW: Cloudinary Storage ONLY for Banners & Story Videos
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "solestyle/banners",
    allowed_formats: ["jpg", "png", "webp", "mp4", "avif"],
    resource_type: "auto"
  }
});

// Add the cloud storage for variants
const variantCloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "solestyle/variants",
    allowed_formats: ["jpg", "png", "webp"],
  }
});

// Create the uploader
const variantCloudUpload = multer({
  storage: variantCloudStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// 5. Existing File Filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|mp4|avif/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype);
  if (extname && mimetype) { cb(null, true); }
  else { cb(new Error("Only images and videos are allowed!"), false); }
};

// 6. Export all three - used for different tasks
export const upload = multer({ storage: storage, fileFilter: fileFilter });
export const variantUpload = multer({ storage: variantStorage, fileFilter: fileFilter });
export const bannerUpload = multer({ storage: bannerStorage, fileFilter: fileFilter });
export { variantCloudUpload };