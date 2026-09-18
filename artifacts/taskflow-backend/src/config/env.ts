import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "defaultSecret",
  mongodbUri: process.env.MONGO_URI || "mongodb://localhost:27017/taskflow",
};

if (!config.mongodbUri) {
  throw new Error("MONGO_URI environment variable is required");
}
