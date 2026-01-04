const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    discount_percentage: { type: Number, required: true, min: 1, max: 99 },

    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },

    status: { type: String, enum: ["active", "inactive"], default: "active" },

    type: {
        type: String,
        enum: ["category", "product", "referral"],
    },

    product_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    category_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }]

}, { timestamps: true });


// Remove 'next' from the arguments
offerSchema.pre('save', async function() {
    if (this.start_date >= this.end_date) {
        // Just throw the error directly!
        throw new Error('End date must be after start date');
    }
    // No need to call next() anymore.
});

module.exports = mongoose.model("Offer", offerSchema);


























// const mongoose = require("mongoose");

// const offerSchema = new mongoose.Schema({
//   name: { type: String, required: true },

//   discount_percentage: { type: Number, required: true },

//   start_date: { type: Date, required: true },
//   end_date: { type: Date, required: true },

//   description: { type: String },

//   banner_image: { type: String },

//   discount_type: {
//     type: String,
//     enum: ["Percentage", "Fixed"],
//     required: true
//   },

//   apply_for: {
//     type: String,
//     enum: ["category", "product"],
//     required: true
//   }
// }, { timestamps: true });

// module.exports = mongoose.model("Offer", offerSchema);
