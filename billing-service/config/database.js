const mongoose = require("mongoose");

let cached = global._mongoConn;
if (!cached) cached = global._mongoConn = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is not set");
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
      maxPoolSize:              5,
      bufferCommands:           false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
