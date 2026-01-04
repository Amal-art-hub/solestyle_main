const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  history: [{
    transaction_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true
    },
    description: {
      type: String,
      default: "Transaction"
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Wallet", walletSchema);
