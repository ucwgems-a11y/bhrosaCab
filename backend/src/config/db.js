const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.warn("Warning: Neither MONGO_URI nor MONGODB_URI is defined in environment.");
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    isConnected = conn.connections[0].readyState >= 1;
    console.log("MongoDB Connected");
    return conn;
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
