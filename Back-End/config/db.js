const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { createIndexes } = require('../utils/databaseIndexes');
dotenv.config();

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.error('MONGO_URI is not set in environment variables');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      // Connection options for better performance
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
    });
    
    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Create indexes after successful connection
    await createIndexes();
    
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
