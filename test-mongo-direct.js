import { MongoClient } from 'mongodb';
import 'dotenv/config';
import dns from 'dns';

dns.setServers(['8.8.8.8']);

// testing cluster0
const uri = process.env.MONGO_URI;
console.log('Testing with Cluster0...');

async function testOptions(name, options) {
  console.log(`\n--- Testing ${name} ---`);
  const client = new MongoClient(uri, {
    ...options,
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
  });

  try {
    await client.connect();
    console.log(`✅ ${name}: Connected successfully`);
    const db = client.db('test');
    await db.command({ ping: 1 });
    console.log('Ping successful');
    return true;
  } catch (err) {
    console.error(`❌ ${name}: Failed`, err.message);
    return false;
  } finally {
    await client.close();
  }
}

async function run() {
  await testOptions('Default', {});
  await testOptions('TLS Allow Invalid Certs', { tlsAllowInvalidCertificates: true });
}

run();
