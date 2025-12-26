const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  status: {
    type: String,
    enum: ["pending", "delivered", "canceled"],
    default: "pending"
  },

  subtotal: { type: Number, required: true },
  final_total: { type: Number, required: true },

  order_number: { type: String, required: true, unique: true },
  tracking_number: { type: String },

  payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },

  order_date: { type: Date, default: Date.now },

  address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },

  discount_amount: { type: Number, default: 0 },

  saved_payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "SavedPayment" },

  feedback_id: { type: mongoose.Schema.Types.ObjectId, ref: "Feedback" },

  shipping_address_snapshot: {
    name: String,
    address_line1: String,
    address_line2: String,
    city: String,
    state: String,
    postal_code: String,
    phone: String,
    alt_phone: String
  },

  shipped_date: { type: Date },
  cancellation_reason: { type: String },

  delivery_charge: { type: Number, default: 0 },

  items: [
    {
      product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
      quantity: { type: Number, required: true },
      total_amount: { type: Number, required: true },
      unit_price: { type: Number, required: true },
      name_snapshot: { type: String },
      variant_snapshot: { type: String },

      status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "canceled", "returned"],
        default: "pending"
      },
      cancellation_reason: { type: String },
      return_reason: { type: String }
    }
  ],

  coupon_id: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
