const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: { type: String,  trim: true },
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: { type: String },
  googleId:{type:String,unique:true,sparse: true},
  phone: { type: String, unique: true ,sparse:true,default:null},
  isVerified: { type: Boolean, default: false },
  isBlock: { type: Boolean, default: false },
  address_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook to hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    this.updatedAt = Date.now();
  } catch (err) {
    throw err;
  }
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
