# 🌾 FarmDirect – Farmer to Consumer Direct Marketplace

A complete, production-ready full-stack web application designed to eliminate agricultural middlemen and connect rural farmers directly with retail consumers across India.

---

## 🚀 Key Features

### 🚜 Farmer Module
- **Farmer Dashboard**: Real-time sales metrics, revenue analytics charts, low-stock warnings, and order counts.
- **Product Management**: Create, edit, delete, and toggle crop listings with image upload/URLs, measurement units (`kg`, `quintal`, `liter`, `dozen`, `piece`, `bunch`), pricing, organic tags, and quality grading.
- **Direct Order Fulfillment**: View incoming multi-crop orders and update shipping stages (`Confirmed` → `Processing` → `Packed` → `Shipped` → `Out for Delivery` → `Delivered`) with tracking numbers.
- **Farm Story & Profile**: Manage public farm story, acreage, organic methods, and district location.

### 🛒 Consumer Module
- **Dynamic Marketplace**: Faceted search with real-time filters (category, price range, organic-only, quality grade, state/district) and sorting (price, newest, ratings).
- **Product Details**: Multi-image preview, stock counters, farmer story card, verified buyer reviews, and related recommendations.
- **Multi-Farmer Cart**: Purchase products from different farmers in a single cart with automatic backend sub-order grouping.
- **Order Tracking**: Visual 4-step delivery timeline, cancellation support, and verified review system with 1–5 star ratings.
- **Wishlist & Address Book**: Save multiple delivery addresses and bookmark seasonal crops.

### 👨‍💼 Admin Master Console
- **Platform Analytics**: Total GMV, user growth trends, monthly revenue chart, and category distribution.
- **User Governance**: Activate, deactivate, or suspend farmer and consumer accounts.
- **Farmer Verification**: Review and approve/reject farmer verification requests.
- **Product Moderation**: Approve, reject, or delist product listings.
- **Global Order Surveillance**: Monitor platform-wide order statuses and settlements.
- **Category Management**: Create, edit, and delete produce categories.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios, Context API, React Router |
| **Backend** | Node.js, Express.js, REST API, JWT Authentication, bcryptjs, Multer, Helmet, Rate Limiting |
| **Database** | MongoDB, Mongoose (Supports Atlas URI & Zero-Setup In-Memory Fallback) |
| **Payments** | Razorpay SDK + Simulated Zero-Friction Test Mode |

---

## 🔑 Demo Login Credentials

You can use the 1-click login buttons on the sign-in page or enter these test credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@farmdirect.com` | `Password@123` |
| **Farmer (Patel Bio-Dynamic)** | `ramesh.farmer@farmdirect.com` | `Password@123` |
| **Farmer (Himalayan Orchards)** | `anand.farmer@farmdirect.com` | `Password@123` |
| **Farmer (Vedic Women's Co-op)**| `sunita.farmer@farmdirect.com` | `Password@123` |
| **Consumer (Priya Sharma)** | `priya.consumer@farmdirect.com` | `Password@123` |
| **Consumer (Rahul Verma)** | `rahul.consumer@farmdirect.com` | `Password@123` |

---

## 💻 Quick Start & Running Locally

### 1. Start Backend Server
```bash
cd backend
npm install
npm run seed      # Seeds admin, farmers, consumers, products, and categories
npm run dev       # Starts backend API on http://localhost:5000
```

### 2. Start Frontend App
```bash
cd frontend
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Tests
```bash
cd backend
npm test
```
All 14 integration test suites test authentication, role-based guards, stock validation, product CRUD, and checkout logic automatically.
