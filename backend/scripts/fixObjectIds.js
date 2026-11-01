const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { connectDB } = require('../config/db');

// Check if a string is a valid 24-character hex ObjectId
function is24Hex(val) {
  return typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);
}

// Recursively convert 24-hex string fields into BSON ObjectId
function convertObjectIds(obj, keyName = '') {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (is24Hex(item)) {
        return new ObjectId(item);
      }
      return convertObjectIds(item);
    });
  }

  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === '_id' && is24Hex(v)) {
      result[k] = new ObjectId(v);
    } else if (
      (k === 'user' ||
        k === 'farmer' ||
        k === 'category' ||
        k === 'product' ||
        k === 'order' ||
        k === 'consumer' ||
        k === 'address' ||
        k === 'defaultAddress' ||
        k.endsWith('Id') ||
        k === 'followedFarmers') &&
      is24Hex(v)
    ) {
      result[k] = new ObjectId(v);
    } else if (typeof v === 'object' && v !== null) {
      result[k] = convertObjectIds(v, k);
    } else {
      result[k] = v;
    }
  }
  return result;
}

async function fixAllCollections() {
  console.log('🔄 Connecting to MongoDB to fix string ObjectIds...');
  await connectDB();
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log(`Found ${collections.length} collections.`);

  for (const colInfo of collections) {
    const colName = colInfo.name;
    if (colName.startsWith('system.')) continue;

    const col = db.collection(colName);
    const docs = await col.find({}).toArray();

    if (docs.length === 0) continue;

    console.log(`Checking ${colName} (${docs.length} documents)...`);
    let convertedCount = 0;

    // Drop and re-insert with proper BSON ObjectIds
    const fixedDocs = docs.map((doc) => convertObjectIds(doc));

    await col.deleteMany({});
    await col.insertMany(fixedDocs);
    console.log(`  ✅ Successfully updated ${colName}: ${fixedDocs.length} records converted to real ObjectIds.`);
  }

  console.log('\n🎉 ALL COLLECTIONS SUCCESSFULLY CONVERTED TO BSON OBJECTIDS!\n');
  await mongoose.disconnect();
  process.exit(0);
}

fixAllCollections().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
