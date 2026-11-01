const mongoose = require('mongoose');

async function activateAll() {
  await mongoose.connect('mongodb://localhost:27017/test');
  const res = await mongoose.connection.db.collection('users').updateMany(
    {},
    { $set: { isActive: true } }
  );
  console.log('Activated all users. Modified count:', res.modifiedCount);
  await mongoose.disconnect();
}

activateAll().catch(console.error);
