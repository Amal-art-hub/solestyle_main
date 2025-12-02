const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema({
  return_id: { type: mongoose.Schema.Types.ObjectId, ref: "Return", required: true },

  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },

  quantity: { type: Number, required: true },
  unit_price_snapshot: { type: Number, required: true },

  name_snapshot: { type: String, required: true },
  variant_snapshot: { type: String, required: true }

}, { timestamps: true });

module.exports = mongoose.model("ReturnItem", returnItemSchema);
