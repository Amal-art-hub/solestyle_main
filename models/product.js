const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true
  },

 isListed: {
  type: Boolean,
  default: true  // New products are listed by default
}
}, { timestamps: true });
module.exports = mongoose.model("Product", productSchema);







// const mongoose = require("mongoose");

// const productSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },

//   description: {
//     type: String,
//     default: ""
//   },

//   categoryId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Category",
//     required: true
//   },

//   brandId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Brand",
//     required: true
//   },

//   images: {
//     type: [String], // store image URLs
//     default: []
//   },

//   isBlocked: {
//     type: Boolean,
//     default: false
//   }
// }, { timestamps: true });

// module.exports = mongoose.model("Product", productSchema);
