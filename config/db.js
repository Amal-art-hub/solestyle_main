import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connect");
    } catch (error) {
        console.log("DB Connection error", error.message);
        process.exit(1);
    }
};

export default connectDB;