const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  name: { type: String, required: true },

  discount_percentage: { type: Number, required: true },

  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },

  description: { type: String },

  banner_image: { type: String },

  discount_type: {
    type: String,
    enum: ["Percentage", "Fixed"],
    required: true
  },

  apply_for: {
    type: String,
    enum: ["category", "product"],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);
