import mongoose from "mongoose";
import { logger } from "./logger";
import { config } from "../config/env";

export async function connectDB() {
  try {
    await mongoose.connect(config.mongodbUri, {
      retryWrites: true,
      w: "majority",
    });
    logger.info("✅ Connected to MongoDB Atlas");
  } catch (error) {
    logger.error(error, "❌ Failed to connect to MongoDB");
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    logger.info("🔌 Disconnected from MongoDB");
  } catch (error) {
    logger.error(error, "⚠️ Error disconnecting from MongoDB");
  }
}

export const db = mongoose;
