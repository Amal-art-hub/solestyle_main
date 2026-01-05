const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String },

  discount_type: { type: String, enum: ["Percentage", "Fixed"], required: true },
  discount_value: { type: Number, required: true },

  mincart_value: { type: Number, default: 0 },

  expiry_date: { type: Date, required: true },
    used_by: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' 
  }],

  status: { type: String, enum: ["active", "inactive"], default: "active" }

}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
