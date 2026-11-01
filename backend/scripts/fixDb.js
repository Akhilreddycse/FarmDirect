const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect('mongodb://localhost:27017/test');
  const res1 = await mongoose.connection.db.collection('users').updateMany(
    { $or: [{ name: /ramesh/i }, { email: /ramesh/i }] },
    { $set: { name: 'Suresh Verma', email: 'suresh.farmer@farmdirect.com' } }
  );
  console.log('Users updated:', res1.modifiedCount);

  const res2 = await mongoose.connection.db.collection('farmerprofiles').updateMany(
    { farmName: /patel/i },
    { $set: { farmName: 'Verma Bio-Dynamic Organic Acres' } }
  );
  console.log('Profiles updated:', res2.modifiedCount);

  await mongoose.disconnect();
  console.log('Done!');
}

fix().catch(console.error);
