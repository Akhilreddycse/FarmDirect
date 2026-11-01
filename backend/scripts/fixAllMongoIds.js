const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { connectDB } = require('../config/db');

function toRealObjectId(val) {
  if (!val) return val;
  if (val instanceof ObjectId) return val;
  if (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) {
    return new ObjectId(val);
  }
  if (typeof val === 'object' && val.buffer) {
    const bytes = Object.values(val.buffer);
    const hex = Buffer.from(bytes).toString('hex');
    if (/^[0-9a-fA-F]{24}$/.test(hex)) {
      return new ObjectId(hex);
    }
  }
  return val;
}

function cleanDoc(val) {
  if (!val || typeof val !== 'object') return val;
  if (Array.isArray(val)) {
    return val.map((item) => cleanDoc(item));
  }
  if (val.buffer && Object.keys(val).length === 1) {
    return toRealObjectId(val);
  }
  const res = {};
  for (const [k, v] of Object.entries(val)) {
    if (
      k === '_id' ||
      k === 'user' ||
      k === 'farmer' ||
      k === 'product' ||
      k === 'category' ||
      k === 'order' ||
      k === 'address' ||
      k === 'defaultAddress' ||
      k === 'consumer' ||
      k.endsWith('Id')
    ) {
      res[k] = toRealObjectId(v);
    } else if (typeof v === 'object' && v !== null) {
      res[k] = cleanDoc(v);
    } else {
      res[k] = v;
    }
  }
  return res;
}

async function fixDatabase() {
  console.log('🔄 Connecting to MongoDB to fix all ObjectIds across all collections...');
  await connectDB();
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  for (const colInfo of collections) {
    const colName = colInfo.name;
    if (colName.startsWith('system.')) continue;

    const col = db.collection(colName);
    const docs = await col.find({}).toArray();
    if (docs.length === 0) continue;

    const fixed = docs.map((doc) => cleanDoc(doc));
    await col.deleteMany({});
    await col.insertMany(fixed);
    console.log(`  ✅ Fixed ${colName}: ${fixed.length} documents updated with true BSON ObjectIds.`);
  }

  console.log('\n🎉 ALL COLLECTIONS PERMANENTLY FIXED WITH TRUE BSON OBJECTIDS!\n');
  await mongoose.disconnect();
  process.exit(0);
}

fixDatabase().catch((err) => {
  console.error('Error fixing database:', err);
  process.exit(1);
});
