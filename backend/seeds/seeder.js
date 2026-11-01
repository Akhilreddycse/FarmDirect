const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, closeDB } = require('../config/db');

dotenv.config();

const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const ConsumerProfile = require('../models/ConsumerProfile');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Connected to database. Purging existing collections...');

    // Clear old data
    await User.deleteMany();
    await FarmerProfile.deleteMany();
    await ConsumerProfile.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Address.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Notification.deleteMany();
    await Payment.deleteMany();

    console.log('[Seeder] Creating Categories...');
    const categoriesData = [
      {
        name: 'Fresh Vegetables',
        slug: 'fresh-vegetables',
        icon: 'Carrot',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        description: 'Farm-fresh daily harvest vegetables grown with zero synthetic pesticides.',
      },
      {
        name: 'Organic Fruits',
        slug: 'organic-fruits',
        icon: 'Apple',
        image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
        description: 'Naturally ripened, sweet, seasonal fruits directly picked from local orchards.',
      },
      {
        name: 'Grains & Rice',
        slug: 'grains-rice',
        icon: 'Wheat',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        description: 'Unpolished traditional grains, basmati, and heirloom paddy varieties.',
      },
      {
        name: 'Pulses & Lentils',
        slug: 'pulses-lentils',
        icon: 'CircleDot',
        image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
        description: 'Native protein-rich unpolished dal directly from pulse farmers.',
      },
      {
        name: 'Spices & Herbs',
        slug: 'spices-herbs',
        icon: 'Flame',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
        description: 'Aromatic whole spices, sun-dried turmeric, and medicinal garden herbs.',
      },
      {
        name: 'Pure Honey & Jaggery',
        slug: 'pure-honey-jaggery',
        icon: 'Hexagon',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
        description: 'Raw unprocessed forest honey and chemical-free organic sugarcane jaggery.',
      },
      {
        name: 'Nutritious Millets',
        slug: 'nutritious-millets',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
        description: 'Ancient superfood millets: Ragi, Foxtail, Pearl, and Little Millet.',
      },
      {
        name: 'Cold-Pressed Oils & Dairy',
        slug: 'cold-pressed-oils-dairy',
        icon: 'Droplet',
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
        description: 'Traditional wood-pressed kachi ghani oils and A2 farm-fresh ghee.',
      },
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((cat) => {
      catMap[cat.name] = cat._id;
    });

    console.log('[Seeder] Creating Users (Admin, Farmers, Consumers)...');

    // 1. Admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@farmdirect.com',
      password: 'Password@123',
      phone: '+91 9876543210',
      role: 'admin',
      isActive: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    // 2. Farmer 1: Anand Sharma
    const farmer1 = await User.create({
      name: 'Anand Sharma',
      email: 'anand.farmer@farmdirect.com',
      password: 'Password@123',
      phone: '+91 9811223344',
      role: 'farmer',
      isActive: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    });

    const farmer1Profile = await FarmerProfile.create({
      user: farmer1._id,
      farmName: 'Sharma Green Organic Acres',
      bio: '3rd generation organic farmer specializing in heirloom tomatoes, exotic vegetables, and cold-pressed mustard oil.',
      experienceYears: 18,
      farmSizeAcres: 12,
      farmingMethods: ['Organic', 'Natural / Vedic'],
      location: {
        village: 'Khed Shivapur',
        district: 'Pune',
        state: 'Maharashtra',
        pincode: '412205',
      },
      isApproved: true,
      ratingAverage: 4.9,
      ratingCount: 42,
      totalSalesAmount: 185000,
      completedOrdersCount: 54,
    });

    // 3. Farmer 2: Anand Sharma
    const farmer2 = await User.create({
      name: 'Anand Sharma',
      email: 'anand.farmer@farmdirect.com',
      password: 'Password@123',
      phone: '+91 9822334455',
      role: 'farmer',
      isActive: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    });

    const farmer2Profile = await FarmerProfile.create({
      user: farmer2._id,
      farmName: 'Himalayan Foothill Orchards',
      bio: 'Cultivating crisp high-altitude apples, walnuts, wild forest honey, and organic basmati paddy in pristine soil.',
      experienceYears: 14,
      farmSizeAcres: 8,
      farmingMethods: ['Organic', 'Regenerative'],
      location: {
        village: 'Kotgarh',
        district: 'Shimla',
        state: 'Himachal Pradesh',
        pincode: '172031',
      },
      isApproved: true,
      ratingAverage: 4.8,
      ratingCount: 38,
      totalSalesAmount: 210000,
      completedOrdersCount: 61,
    });

    // 4. Farmer 3: Sunita Devi
    const farmer3 = await User.create({
      name: 'Sunita Devi',
      email: 'sunita.farmer@farmdirect.com',
      password: 'Password@123',
      phone: '+91 9833445566',
      role: 'farmer',
      isActive: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    });

    const farmer3Profile = await FarmerProfile.create({
      user: farmer3._id,
      farmName: 'Vedic Green Harvest Women’s Co-op',
      bio: 'Leading a cooperative of 25 women farmers producing ancient millets, stone-ground whole spices, and native unpolished lentils.',
      experienceYears: 9,
      farmSizeAcres: 15,
      farmingMethods: ['Zero Budget Natural Farming (ZBNF)', 'Organic'],
      location: {
        village: 'Mandya Rural',
        district: 'Mandya',
        state: 'Karnataka',
        pincode: '571401',
      },
      isApproved: true,
      ratingAverage: 5.0,
      ratingCount: 56,
      totalSalesAmount: 142000,
      completedOrdersCount: 48,
    });

    // 5. Consumer 1: Priya Sharma
    const consumer1 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.consumer@farmdirect.com',
      password: 'Password@123',
      phone: '+91 9988776655',
      role: 'consumer',
      isActive: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    });

    await ConsumerProfile.create({
      user: consumer1._id,
      preferences: { organicOnly: true, preferredCategories: ['Fresh Vegetables', 'Organic Fruits'] },
    });

    // 6. Consumer 2: Rahul Verma
    const consumer2 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul.consumer@farmdirect.com',
      password: 'Password@123',
      phone: '+91 9977665544',
      role: 'consumer',
      isActive: true,
      isVerified: true,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    });

    await ConsumerProfile.create({
      user: consumer2._id,
      preferences: { organicOnly: false, preferredCategories: ['Grains & Rice', 'Pure Honey & Jaggery'] },
    });

    console.log('[Seeder] Creating Addresses for Consumers...');
    const address1 = await Address.create({
      user: consumer1._id,
      fullName: 'Priya Sharma',
      phone: '+91 9988776655',
      houseBuilding: 'Flat 402, Green Orchid Residency',
      street: 'Koregaon Park Road No. 5',
      villageCity: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      landmark: 'Near North Main Road Cafe',
      addressType: 'Home',
      isDefault: true,
    });

    await Address.create({
      user: consumer2._id,
      fullName: 'Rahul Verma',
      phone: '+91 9977665544',
      houseBuilding: 'Villa 12, Palm Meadows',
      street: 'Whitefield Main Road',
      villageCity: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      pincode: '560066',
      landmark: 'Opposite Forum Shantiniketan Mall',
      addressType: 'Home',
      isDefault: true,
    });

    console.log('[Seeder] Creating Agricultural Products...');
    const productsData = [
      // Farmer 1 (Suresh Verma)
      {
        farmer: farmer1._id,
        farmerProfile: farmer1Profile._id,
        name: 'Hydroponic & Organic Vine Cherry Tomatoes',
        description: 'Juicy, naturally sweet vine-ripened red cherry tomatoes bursting with antioxidants. Grown in pesticide-free polyhouses using pure mountain spring water.',
        category: catMap['Fresh Vegetables'],
        images: [
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1546470427-0d4db154ceb7?auto=format&fit=crop&w=800&q=80',
        ],
        price: 85,
        originalPrice: 110,
        unit: 'kg',
        availableQuantity: 45,
        minOrderQuantity: 1,
        farmingMethod: 'Organic',
        isOrganic: true,
        qualityGrade: 'Grade A (Premium)',
        location: { village: 'Khed', district: 'Pune', state: 'Maharashtra' },
        shelfLifeDays: 8,
        ratingAverage: 4.9,
        ratingCount: 24,
        isFeatured: true,
      },
      {
        farmer: farmer1._id,
        farmerProfile: farmer1Profile._id,
        name: 'Farm Fresh Organic Baby Spinach (Palak)',
        description: 'Tender baby spinach leaves harvested fresh every morning. Rich in iron, crisp texture, thoroughly sorted and washed in clean spring water.',
        category: catMap['Fresh Vegetables'],
        images: [
          'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
        ],
        price: 45,
        originalPrice: 60,
        unit: 'bunch',
        availableQuantity: 60,
        minOrderQuantity: 1,
        farmingMethod: 'Natural / Vedic',
        isOrganic: true,
        qualityGrade: 'Grade A (Premium)',
        location: { village: 'Khed', district: 'Pune', state: 'Maharashtra' },
        shelfLifeDays: 5,
        ratingAverage: 4.8,
        ratingCount: 19,
        isFeatured: true,
      },
      {
        farmer: farmer1._id,
        farmerProfile: farmer1Profile._id,
        name: 'Cold-Pressed Raw Yellow Mustard Oil (Kachi Ghani)',
        description: 'Extracted in wooden Kohlu (Ghani) at low temperatures to preserve natural pungent aroma, essential omega-3 fatty acids, and high smoke point.',
        category: catMap['Cold-Pressed Oils & Dairy'],
        images: [
          'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
        ],
        price: 240,
        originalPrice: 280,
        unit: 'liter',
        availableQuantity: 30,
        minOrderQuantity: 1,
        farmingMethod: 'Organic',
        isOrganic: true,
        qualityGrade: 'Certified Organic Export',
        location: { village: 'Khed', district: 'Pune', state: 'Maharashtra' },
        shelfLifeDays: 180,
        ratingAverage: 5.0,
        ratingCount: 31,
        isFeatured: true,
      },
      {
        farmer: farmer1._id,
        farmerProfile: farmer1Profile._id,
        name: 'Organic Red Bell Peppers (Capsicum)',
        description: 'Vibrant, thick-fleshed crunchy red bell peppers packed with Vitamin C. Grown without any chemical fertilizers.',
        category: catMap['Fresh Vegetables'],
        images: [
          'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
        ],
        price: 120,
        originalPrice: 150,
        unit: 'kg',
        availableQuantity: 25,
        minOrderQuantity: 1,
        farmingMethod: 'Organic',
        isOrganic: true,
        qualityGrade: 'Grade A (Premium)',
        location: { village: 'Khed', district: 'Pune', state: 'Maharashtra' },
        shelfLifeDays: 10,
        ratingAverage: 4.7,
        ratingCount: 14,
        isFeatured: false,
      },

      // Farmer 2 (Anand Sharma - Himachal)
      {
        farmer: farmer2._id,
        farmerProfile: farmer2Profile._id,
        name: 'Kinnaur Royal Delicious Crisp Apples',
        description: 'Directly from 7,500 ft elevation orchards. Tree-ripened, naturally sweet, juicy, and wax-free with intense mountain flavor.',
        category: catMap['Organic Fruits'],
        images: [
          'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=800&q=80',
        ],
        price: 180,
        originalPrice: 220,
        unit: 'kg',
        availableQuantity: 80,
        minOrderQuantity: 2,
        farmingMethod: 'Regenerative',
        isOrganic: true,
        qualityGrade: 'Certified Organic Export',
        location: { village: 'Kotgarh', district: 'Shimla', state: 'Himachal Pradesh' },
        shelfLifeDays: 20,
        ratingAverage: 5.0,
        ratingCount: 45,
        isFeatured: true,
      },
      {
        farmer: farmer2._id,
        farmerProfile: farmer2Profile._id,
        name: 'Raw Himalayan Flora Wild Honey',
        description: 'Unheated, unfiltered honey collected by wild bees foraging on medicinal high-altitude forest flora. Contains raw bee pollen and enzymes.',
        category: catMap['Pure Honey & Jaggery'],
        images: [
          'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
        ],
        price: 390,
        originalPrice: 450,
        unit: 'piece',
        availableQuantity: 35,
        minOrderQuantity: 1,
        farmingMethod: 'Natural / Vedic',
        isOrganic: true,
        qualityGrade: 'Grade A (Premium)',
        location: { village: 'Kotgarh', district: 'Shimla', state: 'Himachal Pradesh' },
        shelfLifeDays: 365,
        ratingAverage: 4.9,
        ratingCount: 38,
        isFeatured: true,
      },
      {
        farmer: farmer2._id,
        farmerProfile: farmer2Profile._id,
        name: 'Aromatic Dehradun Basmati Rice (Aged 2 Years)',
        description: 'Long grain, extraordinary aroma, non-sticky premium basmati paddy grown along Himalayan runoff streams and naturally aged.',
        category: catMap['Grains & Rice'],
        images: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        ],
        price: 160,
        originalPrice: 190,
        unit: 'kg',
        availableQuantity: 120,
        minOrderQuantity: 2,
        farmingMethod: 'Organic',
        isOrganic: true,
        qualityGrade: 'Grade A (Premium)',
        location: { village: 'Kotgarh', district: 'Shimla', state: 'Himachal Pradesh' },
        shelfLifeDays: 365,
        ratingAverage: 4.8,
        ratingCount: 29,
        isFeatured: true,
      },

      // Farmer 3 (Sunita Devi - Karnataka)
      {
        farmer: farmer3._id,
        farmerProfile: farmer3Profile._id,
        name: 'Organic Finger Millet (Ragi Whole Grain)',
        description: 'Calcium-dense ancient whole grain millet grown by women farmers without chemical inputs. Ideal for diabetic-friendly rotis, porridge, and dosas.',
        category: catMap['Nutritious Millets'],
        images: [
          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80',
        ],
        price: 75,
        originalPrice: 95,
        unit: 'kg',
        availableQuantity: 150,
        minOrderQuantity: 1,
        farmingMethod: 'Zero Budget Natural Farming (ZBNF)',
        isOrganic: true,
        qualityGrade: 'Certified Organic Export',
        location: { village: 'Mandya Rural', district: 'Mandya', state: 'Karnataka' },
        shelfLifeDays: 180,
        ratingAverage: 5.0,
        ratingCount: 32,
        isFeatured: true,
      },
      {
        farmer: farmer3._id,
        farmerProfile: farmer3Profile._id,
        name: 'Sun-Dried Lakadong Turmeric Powder (Curcumin 7.5%)',
        description: 'High-potency aromatic heirloom turmeric with rich golden color. Grown with Jeevamrutha and dried under hygienic solar conditions.',
        category: catMap['Spices & Herbs'],
        images: [
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
        ],
        price: 140,
        originalPrice: 180,
        unit: 'piece',
        availableQuantity: 70,
        minOrderQuantity: 1,
        farmingMethod: 'Organic',
        isOrganic: true,
        qualityGrade: 'Grade A (Premium)',
        location: { village: 'Mandya Rural', district: 'Mandya', state: 'Karnataka' },
        shelfLifeDays: 365,
        ratingAverage: 4.9,
        ratingCount: 27,
        isFeatured: true,
      },
      {
        farmer: farmer3._id,
        farmerProfile: farmer3Profile._id,
        name: 'Native Unpolished Toor Dal (Pigeon Pea)',
        description: 'Protein packed, chemical-free, untreated unpolished dal with natural sweet aroma and superior cooking time.',
        category: catMap['Pulses & Lentils'],
        images: [
          'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',
        ],
        price: 155,
        originalPrice: 185,
        unit: 'kg',
        availableQuantity: 90,
        minOrderQuantity: 1,
        farmingMethod: 'Zero Budget Natural Farming (ZBNF)',
        isOrganic: true,
        qualityGrade: 'Grade A (Premium)',
        location: { village: 'Mandya Rural', district: 'Mandya', state: 'Karnataka' },
        shelfLifeDays: 180,
        ratingAverage: 4.9,
        ratingCount: 36,
        isFeatured: false,
      },
      {
        farmer: farmer3._id,
        farmerProfile: farmer3Profile._id,
        name: 'Chemical-Free Sugarcane Jaggery Powder (Bella)',
        description: 'Clarified with natural plant mucilage, zero sulphur, preservative-free mineral rich sweetener for daily tea, milk, and sweets.',
        category: catMap['Pure Honey & Jaggery'],
        images: [
          'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=800&q=80',
        ],
        price: 90,
        originalPrice: 120,
        unit: 'kg',
        availableQuantity: 65,
        minOrderQuantity: 1,
        farmingMethod: 'Natural / Vedic',
        isOrganic: true,
        qualityGrade: 'Grade A (Premium)',
        location: { village: 'Mandya Rural', district: 'Mandya', state: 'Karnataka' },
        shelfLifeDays: 180,
        ratingAverage: 4.8,
        ratingCount: 18,
        isFeatured: true,
      },
    ];

    const products = await Product.insertMany(productsData);

    // Update category item counts
    for (const prod of products) {
      await Category.findByIdAndUpdate(prod.category, { $inc: { itemCount: 1 } });
    }

    console.log('[Seeder] Creating Sample Completed Order & Reviews...');
    const sampleOrder = await Order.create({
      orderNumber: 'FD-2026-88412',
      consumer: consumer1._id,
      items: [
        {
          product: products[0]._id, // Cherry Tomatoes (Farmer 1)
          farmer: farmer1._id,
          productName: products[0].name,
          image: products[0].images[0],
          price: products[0].price,
          unit: products[0].unit,
          quantity: 2,
          subtotal: products[0].price * 2,
          itemStatus: 'Delivered',
          trackingNumber: 'TRK-MH-98124',
          statusTimeline: [
            { status: 'Confirmed', timestamp: new Date(Date.now() - 3 * 86400000), note: 'Order confirmed' },
            { status: 'Packed', timestamp: new Date(Date.now() - 2 * 86400000), note: 'Harvested & packed at farm' },
            { status: 'Shipped', timestamp: new Date(Date.now() - 1 * 86400000), note: 'Dispatched to direct courier' },
            { status: 'Delivered', timestamp: new Date(), note: 'Delivered fresh at door' },
          ],
        },
        {
          product: products[4]._id, // Apples (Farmer 2)
          farmer: farmer2._id,
          productName: products[4].name,
          image: products[4].images[0],
          price: products[4].price,
          unit: products[4].unit,
          quantity: 3,
          subtotal: products[4].price * 3,
          itemStatus: 'Delivered',
          trackingNumber: 'TRK-HP-44123',
          statusTimeline: [
            { status: 'Confirmed', timestamp: new Date(Date.now() - 4 * 86400000), note: 'Order confirmed' },
            { status: 'Shipped', timestamp: new Date(Date.now() - 2 * 86400000), note: 'Dispatched via cold line' },
            { status: 'Delivered', timestamp: new Date(), note: 'Delivered successfully' },
          ],
        },
      ],
      subOrders: [
        {
          farmer: farmer1._id,
          items: [],
          farmerSubtotal: products[0].price * 2,
          status: 'Delivered',
          payoutStatus: 'Settled',
        },
        {
          farmer: farmer2._id,
          items: [],
          farmerSubtotal: products[4].price * 3,
          status: 'Delivered',
          payoutStatus: 'Settled',
        },
      ],
      shippingAddress: {
        fullName: address1.fullName,
        phone: address1.phone,
        houseBuilding: address1.houseBuilding,
        street: address1.street,
        villageCity: address1.villageCity,
        district: address1.district,
        state: address1.state,
        pincode: address1.pincode,
        landmark: address1.landmark,
        addressType: 'Home',
      },
      paymentMethod: 'ONLINE',
      paymentStatus: 'Completed',
      paymentDetails: {
        razorpayOrderId: 'order_demo_seed_001',
        razorpayPaymentId: 'pay_demo_seed_001',
        paidAt: new Date(Date.now() - 3 * 86400000),
      },
      subtotal: products[0].price * 2 + products[4].price * 3,
      deliveryFee: 0,
      totalAmount: products[0].price * 2 + products[4].price * 3,
      overallStatus: 'Delivered',
      deliveredAt: new Date(),
    });

    // Create Reviews for delivered products
    await Review.create({
      product: products[0]._id,
      farmer: farmer1._id,
      consumer: consumer1._id,
      order: sampleOrder._id,
      rating: 5,
      comment: 'Super fresh cherry tomatoes! Sweet and crunchy, arrived within 24 hours of harvest. My kids loved them in salads.',
    });

    await Review.create({
      product: products[4]._id,
      farmer: farmer2._id,
      consumer: consumer1._id,
      order: sampleOrder._id,
      rating: 5,
      comment: 'Unbelievable aroma from these Kinnaur apples. Real crisp texture with no wax coating. Will definitely subscribe regularly!',
    });

    // Create sample notifications
    await Notification.create({
      recipient: farmer1._id,
      title: 'Welcome to FarmDirect! 🚜',
      message: 'Your farmer storefront is live. Add new crops or manage orders easily from your dashboard.',
      type: 'system',
    });

    await Notification.create({
      recipient: consumer1._id,
      title: 'Your Farm Box was Delivered! 📦',
      message: 'Order #FD-2026-88412 was successfully delivered. Please take a moment to rate the farmers.',
      type: 'order',
      link: `/orders/${sampleOrder._id}`,
    });

    console.log('\n=============================================================');
    console.log('  ✅ FarmDirect Database Seeded Successfully!');
    console.log('=============================================================');
    console.log('  Demo Credentials for Testing:');
    console.log('  👨‍💼 Admin:    admin@farmdirect.com          / Password@123');
    console.log('  🚜 Farmer:   anand.farmer@farmdirect.com   / Password@123');
    console.log('  🚜 Farmer 2: anand.farmer@farmdirect.com   / Password@123');
    console.log('  🛒 Consumer: priya.consumer@farmdirect.com / Password@123');
    console.log('  🛒 Consumer: rahul.consumer@farmdirect.com / Password@123');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seeder] Seeding Error:', err);
    process.exit(1);
  }
};

seedData();
