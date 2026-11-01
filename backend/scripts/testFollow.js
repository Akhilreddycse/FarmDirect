async function test() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya.consumer@farmdirect.com', password: 'Password@123' })
  });
  const loginData = await loginRes.json();
  console.log('LOGIN DATA:', loginData);

  const res = await fetch('http://localhost:5000/api/follow/6ac67b2dba966e9de626904f', {
    method: 'POST',
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  console.log('FOLLOW STATUS:', res.status);
  console.log('FOLLOW BODY:', await res.json());

  const myFarmsRes = await fetch('http://localhost:5000/api/follow/my-farms', {
    headers: { Authorization: `Bearer ${loginData.token}` }
  });
  console.log('MY FARMS STATUS:', myFarmsRes.status);
  console.log('MY FARMS BODY:', await myFarmsRes.json());
}
test();
