const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema({
  order_Id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },

  reason: { type: String, required: true },
  additional_comment: { type: String },

  amount: { type: Number, required: true },

  refund_method: { 
    type: String, 
    enum: ["Original Payment Method", "Store Credit", "Bank Transfer"],
    required: true
  },

  tracking_number: { type: String },

  return_address_id: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },

  status: {
    type: String,
    enum: ["Requested", "Approved", "In Transit", "Received", "Proccessed", "Rejected"],
    default: "Requested"
  }

}, { timestamps: true });

module.exports = mongoose.model("Return", returnSchema);
