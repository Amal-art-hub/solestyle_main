import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true
  },

  isListed: {
    type: Boolean,
    default: true  // New products are listed by default
  }
}, { timestamps: true });

productSchema.index({ categoryId: 1 });
productSchema.index({ brandId: 1 });
productSchema.index({ isListed: 1 });

export default mongoose.model("Product", productSchema);
