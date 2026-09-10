const mongoose = require("mongoose");

let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Neither MONGO_URI nor MONGODB_URI is defined in environment variables. Please configure MONGO_URI in Vercel Project Settings."
    );
  }

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 8000,
      })
      .then((conn) => {
        console.log("MongoDB Connected");
        return conn;
      })
      .catch((err) => {
        cachedPromise = null;
        console.error("MongoDB Connection Error:", err.message);
        throw err;
      });
  }

  return cachedPromise;
};

module.exports = connectDB;
