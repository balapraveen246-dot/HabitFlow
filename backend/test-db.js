require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();

    await client.db("admin").command({ ping: 1 });

    console.log("✅ MongoDB connection successful!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);
  } finally {
    await client.close();
  }
}

testConnection();