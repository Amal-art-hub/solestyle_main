const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },

      quantity: { type: Number, required: true, min: 1 },

      price_at_addition: { type: Number, required: true },

      name_snapshot: { type: String, required: true },
      image_snapshot: { type: String, required: true }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
