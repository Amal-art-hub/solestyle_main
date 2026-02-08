const mongoose = require("mongoose");

const brandSectionSchema = new mongoose.Schema({
    title: { type: String, default: "Our Story" },
    subtitle: { type: String, default: "Crafted for comfort, designed for style." },
    videoUrl: { type: String, required: true }, 
    buttonText: { type: String, default: "Learn More" },
    link: { type: String, default: "/about" },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("BrandSection", brandSectionSchema);