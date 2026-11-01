const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Safe database restore utility from latest backup
async function runRestore() {
  const latestDir = path.join(__dirname, '../backups/latest');
  if (!fs.existsSync(latestDir)) {
    console.error('❌ No backup directory found at backend/backups/latest');
    process.exit(1);
  }

  console.log('🔄 Starting Safe FarmDirect Database Restore from latest backup...');

  let connected = false;
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/test', { serverSelectionTimeoutMS: 2000 });
    connected = true;
    console.log('✅ Connected to active MongoDB instance on port 27017.');
  } catch (err) {
    try {
      console.log('ℹ️ Active MongoDB not detected, connecting via internal storage...');
      const { connectDB } = require('../config/db');
      await connectDB();
      connected = true;
    } catch (innerErr) {
      console.error('❌ Failed to connect to database for restore:', innerErr.message);
      process.exit(1);
    }
  }

  if (!connected) {
    console.error('❌ Could not establish database connection.');
    process.exit(1);
  }

  const files = fs.readdirSync(latestDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} collection backup files.`);

  for (const file of files) {
    const colName = path.basename(file, '.json');
    const content = JSON.parse(fs.readFileSync(path.join(latestDir, file), 'utf8'));

    if (Array.isArray(content) && content.length > 0) {
      const col = mongoose.connection.db.collection(colName);
      await col.deleteMany({});
      await col.insertMany(content);
      console.log(`  ✓ Restored ${colName}: ${content.length} records`);
    } else {
      console.log(`  - Skipped ${colName} (empty)`);
    }
  }

  console.log('\n🎉 Restore complete! All records restored safely from latest backup.\n');
  await mongoose.disconnect();
  process.exit(0);
}

runRestore().catch((err) => {
  console.error('Restore failed:', err);
  process.exit(1);
});
