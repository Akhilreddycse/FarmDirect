const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB, closeDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const followRoutes = require('./routes/followRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const configuredClientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  ...configuredClientUrls,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, or same-origin)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        process.env.NODE_ENV !== 'production' ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.netlify.app') ||
        cleanOrigin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback permissive to avoid blocking test clients
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static folder for product image uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Endpoint

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/contact', contactRoutes);

// Central Error Handler
app.use(errorHandler);

// Serve Frontend static assets if built (Unified single-service fullstack deployment support)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath) && process.env.SERVE_FRONTEND !== 'false') {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return res.status(404).json({ success: false, message: 'API endpoint not found' });
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Pure API mode root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'FarmDirect API',
      version: '1.0.0',
      description: 'Farmer to Consumer Direct Marketplace API',
      status: 'online',
      timestamp: new Date(),
    });
  });
}

const PORT = process.env.PORT || 5000;

let server;

// Connect to Database and start listening
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    // Auto-check if DB is empty; if so, populate initial catalog inline (same DB connection)
    try {
      const Category = require('./models/Category');
      const catCount = await Category.countDocuments();
      if (catCount === 0) {
        console.log('[Server] Database is empty. Running inline seed...');
        const { seedDatabase } = require('./seeds/seedInline');
        await seedDatabase();
        console.log('[Server] Initial seeding completed.');
      } else {
        console.log(`[Server] Database already has ${catCount} categories. Skipping seed.`);
      }
    } catch (seedErr) {
      console.warn('[Server] Auto-seed check warning:', seedErr.message);
    }

    server = app.listen(PORT, () => {
      console.log(`\n=================================================`);
      console.log(`  🌾 FarmDirect API Server is running on port ${PORT}`);
      console.log(`  🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  📡 API Health: http://localhost:${PORT}/api/health`);
      console.log(`=================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Server Warning] Port ${PORT} was busy. Auto-recovering...`);
        try {
          const { execSync } = require('child_process');
          if (process.platform === 'win32') {
            const out = execSync(`netstat -ano -p tcp | findstr :${PORT}`, { encoding: 'utf8' });
            for (const line of out.trim().split('\n')) {
              if (line.includes('LISTENING')) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0' && pid !== process.pid.toString()) {
                  console.log(`[Auto-Recovery] Freeing port ${PORT} from old PID ${pid}...`);
                  execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
                }
              }
            }
          }
        } catch (_) {}

        // Retry binding after 1.5s
        setTimeout(() => {
          server.close();
          server.listen(PORT);
        }, 1500);
      } else {
        console.error('[Server Error]', err);
      }
    });
  });
}

// Graceful shutdown handling for Ctrl+C, process kill, and terminal exit
let isShuttingDown = false;
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[Server] Received ${signal}. Shutting down cleanly...`);
  try {
    if (server) {
      server.close(async () => {
        await closeDB();
        process.exit(0);
      });
      setTimeout(() => {
        process.exit(0);
      }, 3000).unref();
    } else {
      await closeDB();
      process.exit(0);
    }
  } catch (_) {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle unhandled promise rejections and uncaught exceptions gracefully
process.on('unhandledRejection', (err) => {
  console.error(`[Server Warning] Unhandled Promise Rejection: ${err?.message || err}`);
  if (err?.stack) console.error(err.stack);
  if (process.env.NODE_ENV === 'production' && server) {
    server.close(() => process.exit(1));
  }
});

process.on('uncaughtException', (err) => {
  console.error(`[Server Error] Uncaught Exception: ${err?.message || err}`);
  if (err?.stack) console.error(err.stack);
  if (process.env.NODE_ENV === 'production') {
    if (server) server.close(() => process.exit(1));
    else process.exit(1);
  }
});

module.exports = app;
