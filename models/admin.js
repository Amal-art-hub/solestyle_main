const mongoose = require("mongoose");
const { genSalt, hash, compare } = require("bcrypt");

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });


// Use async/await without next() callback for newer Mongoose versions
adminSchema.pre("save", async function () {
    // Only hash password if it's **not already hashed**
    if (!this.isModified("password")) return;

    // If password already starts with bcrypt prefix, skip hashing
    if (this.password.startsWith("$2b$")) return;

    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
});


adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await compare(candidatePassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;