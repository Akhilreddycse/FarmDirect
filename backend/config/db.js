const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

let mongodInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (mongoUri && mongoUri.trim() !== '') {
      const conn = await mongoose.connect(mongoUri);
      console.log(`[Database] MongoDB Connected to external instance: ${conn.connection.host}`);
      return conn;
    }

    // Persistent Local Embedded MongoDB (saves database to disk in backend/data/db)
    const dbDir = path.join(__dirname, '../data/db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Clear stale lock file if left behind by an unclean previous process exit
    const lockFile = path.join(dbDir, 'mongod.lock');
    if (fs.existsSync(lockFile)) {
      try {
        fs.unlinkSync(lockFile);
      } catch (_) {
        // Will be handled by MongoMemoryServer or fallback if still in use
      }
    }

    console.log(`[Database] Starting persistent local MongoDB instance at: ${dbDir}`);
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbPath: dbDir,
        storageEngine: 'wiredTiger',
      },
    });

    const memoryUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[Database] Persistent Embedded MongoDB Server active at: ${memoryUri}`);
    return conn;
  } catch (error) {
    console.error(`[Database] MongoDB Connection Error: ${error.message}`);
    try {
      console.log('[Database] Attempting fallback embedded MongoDB instance...');
      mongodInstance = await MongoMemoryServer.create();
      const memoryUri = mongodInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[Database] Fallback Embedded MongoDB Server active at: ${memoryUri}`);
      return conn;
    } catch (fallbackError) {
      console.error(`[Database] Embedded MongoDB Fallback Failed: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  try {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
  } catch (err) {
    console.error(`[Database] Error closing connection: ${err.message}`);
  }
};

module.exports = { connectDB, closeDB };
