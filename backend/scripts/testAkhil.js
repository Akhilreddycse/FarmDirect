async function testAkhil() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'akhil1@gmail.com', password: 'Password@123' })
  });
  const loginData = await loginRes.json();
  console.log('Akhil Login Status:', loginRes.status, 'Success:', loginData.success);
  if (loginData.success) {
    const getRes = await fetch('http://localhost:5000/api/farmer/profile', {
      headers: { Authorization: `Bearer ${loginData.token}` }
    });
    const getData = await getRes.json();
    console.log('GET Akhil Farm Profile:', getRes.status, 'Farm:', getData.profile?.farmName);
  }
}
testAkhil();
