const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

async function fixDates() {
  console.log('🔄 Cleaning up invalid date fields in MongoDB Atlas...');
  await connectDB();
  const db = mongoose.connection.db;
  const cols = await db.listCollections().toArray();

  for (const c of cols) {
    if (c.name.startsWith('system.')) continue;
    const col = db.collection(c.name);
    const docs = await col.find({}).toArray();

    let updated = 0;
    for (const doc of docs) {
      const updateFields = {};
      let changed = false;

      // Fix createdAt if it is an empty object
      if (doc.createdAt && typeof doc.createdAt === 'object' && !(doc.createdAt instanceof Date)) {
        updateFields.createdAt = new Date();
        changed = true;
      }
      // Fix updatedAt if it is an empty object
      if (doc.updatedAt && typeof doc.updatedAt === 'object' && !(doc.updatedAt instanceof Date)) {
        updateFields.updatedAt = new Date();
        changed = true;
      }

      if (changed) {
        await col.updateOne({ _id: doc._id }, { $set: updateFields });
        updated++;
      }
    }
    if (updated > 0) {
      console.log(`  ✅ Fixed dates for ${c.name}: ${updated} records updated.`);
    }
  }

  console.log('\n🎉 ALL DATE CASTING ISSUES PERMANENTLY RESOLVED!\n');
  await mongoose.disconnect();
  process.exit(0);
}

fixDates().catch((err) => {
  console.error('Date cleanup failed:', err);
  process.exit(1);
});
