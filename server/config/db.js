import mongoose from 'mongoose';
import dns from 'dns';

// Override DNS to use Google DNS for SRV resolution (fixes querySrv ECONNREFUSED)
dns.setServers(['8.8.8.8', '8.8.4.4']);

let isDbConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isDbConnected = true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Backend is running in "Autonomous Memory Mode" (No Database).');
    console.info('💡 Data will be kept in memory and reset on server restart.');
    isDbConnected = false;
  }
};

export { isDbConnected };
export default connectDB;
