import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  size: {
    type: String,
    required: true
  },

  color: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  offerPrice: {
    type: Number,
    default: null
  },
  isListed: {
    type: Boolean,
    default: true
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function (images) {
        return images.length >= 3 && images.length <= 10;
      },
      message: "Variant must have between 3 and 10 images"
    }
  },
}, { timestamps: true });

variantSchema.index({ productId: 1, color: 1, size: 1 }, { unique: true });

export default mongoose.model("Variant", variantSchema);
