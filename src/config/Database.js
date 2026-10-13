import mongoose from "mongoose";
import config from "./config.js";

const ConnectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    console.log("MongoDB URI exists:", !!config.MONGODB_URI);

    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

export default ConnectDB;
