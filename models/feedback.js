const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },

  description: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 }

}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
