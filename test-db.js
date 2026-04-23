import mongoose from 'mongoose';
import 'dotenv/config';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const testConnection = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
  }
  console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':****@'));
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Success!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    console.log('\n💡 Troubleshooting Tips:');
    if (err.message.includes('ECONNREFUSED')) {
      console.log('- Check if your IP address is whitelisted in MongoDB Atlas (Network Access).');
      console.log('- Ensure your network allows connections on port 27017.');
      console.log('- If using a corporate VPN, it might block SRV lookups.');
    }
    if (err.message.includes('Authentication failed')) {
      console.log('- Check if your database username and password are correct in .env.');
    }
    process.exit(1);
  }
};

testConnection();
