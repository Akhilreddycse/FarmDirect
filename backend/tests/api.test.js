const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_farmdirect_2026';

const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

let mongod;
let server;
let baseUrl;

// Helper to make fetch/http requests
const request = async (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('\n========================================');
  console.log('  🧪 Running FarmDirect API Test Suite');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    // 1. Setup in-memory database & test server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);

    server = app.listen(0);
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;

    // Test 1: Health Check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'API Server health check endpoint');

    // Test 2: Consumer Registration
    const consumerRes = await request('POST', '/api/auth/register', {
      name: 'Test Consumer',
      email: 'consumer@test.com',
      password: 'Password123',
      role: 'consumer',
    });
    assert(consumerRes.status === 201 && consumerRes.body.token, 'Consumer registration & JWT generation');
    const consumerToken = consumerRes.body.token;

    // Test 3: Farmer Registration
    const farmerRes = await request('POST', '/api/auth/register', {
      name: 'Test Farmer',
      email: 'farmer@test.com',
      password: 'Password123',
      role: 'farmer',
      farmName: 'Green Valley Organic Farm',
    });
    assert(farmerRes.status === 201 && farmerRes.body.user.role === 'farmer', 'Farmer registration & profile association');
    const farmerToken = farmerRes.body.token;

    // Test 4: Prevent Public Admin Registration
    const adminRegisterAttempt = await request('POST', '/api/auth/register', {
      name: 'Fake Admin',
      email: 'hacker@test.com',
      password: 'Password123',
      role: 'admin',
    });
    assert(adminRegisterAttempt.status === 403, 'Security: Disallow public admin registration');

    // Test 5: Farmer creates category & Product
    const testCategory = await Category.create({ name: 'Fresh Vegetables', description: 'Fresh veggies' });

    const prodRes = await request(
      'POST',
      '/api/products',
      {
        name: 'Organic Tomatoes',
        description: 'Naturally grown tomatoes',
        category: testCategory._id,
        price: 50,
        unit: 'kg',
        availableQuantity: 20,
        farmingMethod: 'Organic',
        isOrganic: true,
      },
      farmerToken
    );
    assert(prodRes.status === 201 && prodRes.body.product.price === 50, 'Farmer product listing creation');
    const productId = prodRes.body.product._id;

    // Test 6: Consumer forbidden from creating products
    const consumerProdAttempt = await request(
      'POST',
      '/api/products',
      {
        name: 'Illegal Product',
        description: 'Should fail',
        category: testCategory._id,
        price: 10,
        availableQuantity: 5,
      },
      consumerToken
    );
    assert(consumerProdAttempt.status === 403, 'Role guard: Consumer forbidden from adding products');

    // Test 7: Public Product Search & Filtering
    const searchRes = await request('GET', '/api/products?keyword=Tomatoes&organic=true');
    assert(
      searchRes.status === 200 && searchRes.body.products.length >= 1,
      'Product faceted search and organic filtering'
    );

    // Test 8: Cart Addition & Live Stock Checks
    const cartAddRes = await request(
      'POST',
      '/api/cart',
      {
        productId,
        quantity: 3,
      },
      consumerToken
    );
    assert(cartAddRes.status === 200, 'Consumer add product to cart');

    // Test 9: Cart Excessive Quantity Rejection
    const cartExcessAttempt = await request(
      'POST',
      '/api/cart',
      {
        productId,
        quantity: 500, // exceeds available stock 20
      },
      consumerToken
    );
    assert(cartExcessAttempt.status === 400, 'Stock validation: Reject cart quantity exceeding inventory');

    // Test 10: Multi-farmer Checkout & Stock Decrement
    const orderRes = await request(
      'POST',
      '/api/orders',
      {
        shippingAddress: {
          fullName: 'Test Consumer',
          phone: '+91 9876543210',
          houseBuilding: 'Flat 101',
          street: 'Main Street',
          villageCity: 'Pune',
          district: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
        },
        paymentMethod: 'COD',
      },
      consumerToken
    );
    assert(orderRes.status === 201 && orderRes.body.order.orderNumber, 'Consumer order creation & multi-farmer grouping');
    const orderId = orderRes.body.order._id;

    // Verify stock decremented (20 - 3 = 17)
    const updatedProd = await Product.findById(productId);
    assert(updatedProd.availableQuantity === 17, 'Inventory stock atomically decremented upon order placement');

    // Test 11: Farmer Order Status Update
    const farmerOrderItemId = orderRes.body.order.items[0]._id;
    const statusUpdateRes = await request(
      'PUT',
      `/api/orders/${orderId}/items/${farmerOrderItemId}/status`,
      {
        status: 'Packed',
        note: 'Harvested fresh and packed',
      },
      farmerToken
    );
    assert(statusUpdateRes.status === 200, 'Farmer fulfillment lifecycle status update');

    // Test 12: Admin Role Guard & Protected Endpoints
    const adminUser = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: 'Password123',
      role: 'admin',
    });
    const adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET);

    const adminDashRes = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert(adminDashRes.status === 200 && adminDashRes.body.stats.totalUsers >= 3, 'Admin dashboard & platform metrics');

    const consumerAdminAttempt = await request('GET', '/api/admin/dashboard', null, consumerToken);
    assert(consumerAdminAttempt.status === 403, 'Role guard: Consumer forbidden from accessing Admin API');

    console.log('\n========================================');
    console.log(`  Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('========================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    if (mongoose.connection) await mongoose.connection.close();
    if (mongod) await mongod.stop();
    process.exit(0);
  }
};

runTests();
