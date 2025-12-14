const { MongoClient } = require('mongodb');
const config = require('./config');

let client;
let db;

async function connect() {
  if (db) return db;
  if (
    !config.mongoUri ||
    !(config.mongoUri.startsWith('mongodb://') || config.mongoUri.startsWith('mongodb+srv://'))
  ) {
    throw new Error('MongoDB connection string not set or invalid. Configure `src/config.js` or set environment variable `MONGO_URI` (must start with "mongodb://" or "mongodb+srv://").');
  }

  client = new MongoClient(config.mongoUri);
  await client.connect();
  db = client.db(config.dbName);
  return db;
}

function getCollection(name) {
  if (!db) throw new Error('Database not connected. Call connect() first.');
  return db.collection(name);
}

function getClient() {
  return client;
}

module.exports = { connect, getCollection, getClient };
