const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Read-only backup utility
async function runBackup() {
  console.log('📦 Starting Safe FarmDirect Database Backup...');

  let connected = false;

  // 1. Try connecting to the active running MongoDB instance
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/test', { serverSelectionTimeoutMS: 2000 });
    connected = true;
    console.log('✅ Connected to active MongoDB instance on port 27017.');
  } catch (err) {
    // 2. If not running, fall back to embedded DB reader
    try {
      console.log('ℹ️ Active MongoDB not detected, connecting via internal storage...');
      const { connectDB } = require('../config/db');
      await connectDB();
      connected = true;
    } catch (innerErr) {
      console.error('❌ Failed to connect to database for backup:', innerErr.message);
      process.exit(1);
    }
  }

  if (!connected) {
    console.error('❌ Could not establish database connection.');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups', `backup-${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`Found ${collections.length} collections to back up.`);

  for (const col of collections) {
    const colName = col.name;
    // Skip internal system collections
    if (colName.startsWith('system.')) continue;

    const data = await mongoose.connection.db.collection(colName).find({}).toArray();
    const filePath = path.join(backupDir, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`  ✓ Exported ${colName}: ${data.length} records -> ${colName}.json`);
  }

  // Also create/update a 'latest' copy for easy access
  const latestDir = path.join(__dirname, '../backups/latest');
  fs.mkdirSync(latestDir, { recursive: true });
  for (const col of collections) {
    if (col.name.startsWith('system.')) continue;
    const srcFile = path.join(backupDir, `${col.name}.json`);
    const dstFile = path.join(latestDir, `${col.name}.json`);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, dstFile);
    }
  }

  console.log(`\n🎉 Backup complete! All data safely exported to:`);
  console.log(`📁 ${backupDir}`);
  console.log(`📁 ${latestDir} (latest copy)\n`);

  await mongoose.disconnect();
  process.exit(0);
}

runBackup().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
