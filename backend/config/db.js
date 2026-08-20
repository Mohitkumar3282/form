const mongoose = require('mongoose');

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/customer_db';
  
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    console.warn(`⚠️ Could not connect to primary MongoDB (${err.message}).`);
    console.log('🔄 Initializing in-memory MongoDB fallback server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('✅ Connected to In-Memory MongoDB server successfully!');
    } catch (memErr) {
      console.error('❌ Failed to start In-Memory MongoDB fallback:', memErr.message);
    }
  }
}

module.exports = connectDB;
