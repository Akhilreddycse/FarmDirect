async function testFarmerProfile() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'anand.farmer@farmdirect.com', password: 'Password@123' })
    });
    const loginData = await loginRes.json();
    console.log('Farmer Login Status:', loginRes.status, 'Success:', loginData.success);

    const token = loginData.token;

    // 1. GET farmer profile
    const getRes = await fetch('http://localhost:5000/api/farmer/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getData = await getRes.json();
    console.log('GET /api/farmer/profile Status:', getRes.status, 'FarmName:', getData.profile?.farmName);

    // 2. PUT update profile via /api/auth/profile
    const updateRes = await fetch('http://localhost:5000/api/auth/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Anand Sharma',
        phone: '+91 9822334455',
        farmName: 'Himalayan Foothill Orchards',
        bio: 'Cultivating crisp high-altitude apples, walnuts, and wild forest honey in pristine soil.',
        experienceYears: 14,
        farmingMethods: ['Organic', 'Regenerative'],
        location: {
          village: 'Kotgarh',
          district: 'Shimla',
          state: 'Himachal Pradesh',
          pincode: '171201'
        }
      })
    });
    const updateData = await updateRes.json();
    console.log('PUT /api/auth/profile Status:', updateRes.status, 'Success:', updateData.success);
    console.log('Updated user:', updateData.user?.name, 'Farm:', updateData.user?.farmerProfile?.farmName);

  } catch (err) {
    console.error('Error:', err);
  }
}

testFarmerProfile();
