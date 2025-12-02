const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  size: { type: String }, // optional depending on product
  color: { type: String },

  stock: {
    type: Number,
    required: true,
    min: 0
  },

  price: {
    type: Number,
    required: true
  },

  offerPrice: {
    type: Number,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("Variant", variantSchema);
