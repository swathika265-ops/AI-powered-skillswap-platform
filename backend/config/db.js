const mongoose = require('mongoose');

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 7000,
  };

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    try {
      console.log('Retrying MongoDB connection over IPv6...');
      const conn = await mongoose.connect(process.env.MONGODB_URI, { ...options, family: 6 });
      console.log(`✅ MongoDB Connected (IPv6): ${conn.connection.host}`);
      return conn;
    } catch (ipv6Error) {
      console.error(`❌ MongoDB connection error: ${ipv6Error.message}`);
      console.error(`\n💡 Fix: Go to MongoDB Atlas → Network Access → Add IP Address → "Allow Access from Anywhere" (0.0.0.0/0)`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
