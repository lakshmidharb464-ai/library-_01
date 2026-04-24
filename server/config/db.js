import mongoose from 'mongoose';
import dns from 'dns';

// Override DNS to use Google DNS for SRV resolution (fixes querySrv ECONNREFUSED)
dns.setServers(['8.8.8.8', '8.8.4.4']);

let isDbConnected = false;
let resolveDb;
const dbPromise = new Promise(resolve => {
  resolveDb = resolve;
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isDbConnected = true;
    resolveDb(true);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Backend is running in "Autonomous Memory Mode" (No Database).');
    console.info('💡 Data will be kept in memory and reset on server restart.');
    isDbConnected = false;
    resolveDb(false);
    return null;
  }
};

export { isDbConnected, dbPromise };
export default connectDB;
