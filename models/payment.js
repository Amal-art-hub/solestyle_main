const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }, // Required!
  
  payment_method: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
  

  transaction_id: { type: String } 

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
