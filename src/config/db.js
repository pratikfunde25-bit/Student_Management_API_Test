const mongoose = require('mongoose');
const env = require('./env');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

const connectDB = async () => {
  mongoose.set('strictQuery', true);

  try {
    // Try to connect to the provided URI first
    const connection = await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== 'production',
      serverSelectionTimeoutMS: 2000, // Fail fast if no local db is running
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Could not connect to MongoDB at ${env.mongoUri}.`);
    console.log(`🚀 Starting an In-Memory MongoDB Replica Set for you...`);
    
    // Automatically spin up an in-memory replica set (required for transactions)
    const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = replSet.getUri();
    
    await mongoose.connect(uri, {
      autoIndex: env.nodeEnv !== 'production',
    });
    console.log(`✅ In-Memory MongoDB Replica Set connected at: ${uri}`);
    console.log(`💡 Note: Data will be lost when the server restarts.`);
  }
};

module.exports = connectDB;
