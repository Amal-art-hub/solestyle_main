const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true  
  },
  products: [{  
    products_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);