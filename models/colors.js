import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

export default mongoose.model("Color", colorSchema);
