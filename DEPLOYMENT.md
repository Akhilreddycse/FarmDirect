# 🚀 FarmDirect Deployment Guide

This guide walks you through deploying **FarmDirect** to production step-by-step.

---

## 🌟 Choose Your Deployment Architecture

| Architecture | Best For | Estimated Cost | Setup Complexity |
| :--- | :--- | :--- | :--- |
| **Option 1: Vercel (Frontend) + Render (Backend)** | Best performance & instant global CDN for UI | **100% Free** | Low (5 mins) |
| **Option 2: Unified Monolith on Render** | Single domain, no CORS setup, single service | **100% Free** | Very Low (3 mins) |

---

## 🗄️ Step 0: Set Up Free Cloud MongoDB (MongoDB Atlas)

Because local storage on cloud hosting is ephemeral, you need a free cloud database:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Click **Create Cluster** and select the **M0 Free Tier**.
3. Under **Security → Database Access**, create a user (e.g. `farmuser`) with a strong password.
4. Under **Security → Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect → Drivers (Node.js)** and copy your connection string:
   ```text
   mongodb+srv://farmuser:<password>@cluster0.xxxxx.mongodb.net/farmdirect?retryWrites=true&w=majority
   ```

---

## 🚀 Option 1: Frontend on Vercel + Backend on Render (Recommended)

### A. Deploy Backend to Render
1. Push your project to a GitHub repository.
2. Go to [Render.com](https://render.com) and click **New → Web Service**.
3. Connect your GitHub repository.
4. Configure the settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `JWT_SECRET`: *(A long random secret string)*
   - `MONGO_URI`: *(Your MongoDB Atlas connection string from Step 0)*
   - `CLIENT_URL`: `https://your-frontend-project.vercel.app` *(update once frontend is deployed)*
   - *(Optional Cloudinary variables for persistent image uploads)*
6. Click **Deploy Web Service**.
7. Copy your live backend URL (e.g., `https://farmdirect-backend.onrender.com`).

### B. Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and click **Add New → Project**.
2. Import the same GitHub repository.
3. Configure the project:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://farmdirect-backend.onrender.com` *(your Render backend URL)*
5. Click **Deploy**.
6. Copy your frontend URL and paste it back into Render's `CLIENT_URL` variable.

---

## 📦 Option 2: Unified Monolith on Render (Single Service)

You can run both the React frontend and Node.js backend from a single Render web service:

1. In Render, select **New → Web Service** and connect your GitHub repository.
2. Configure settings:
   - **Root Directory**: *(Leave blank - root directory)*
   - **Build Command**: `npm install --prefix backend && npm install --prefix frontend && npm --prefix frontend run build`
   - **Start Command**: `npm --prefix backend start`
3. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `JWT_SECRET`: *(A long random secret string)*
   - `MONGO_URI`: *(Your MongoDB Atlas connection string from Step 0)*
4. Click **Deploy**.
5. Once deployed, Render will serve both the React app and `/api` from a single domain!

---

## 🔑 Production Environment Variables Reference

### Backend Environment Variables
| Variable | Required? | Example / Value | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Enables production optimizations |
| `PORT` | **Yes** | `5000` | Port for Express server |
| `MONGO_URI` | **Yes** | `mongodb+srv://...` | Cloud MongoDB Atlas URI |
| `JWT_SECRET` | **Yes** | `random_secure_key_123` | Secret for signing auth tokens |
| `JWT_EXPIRE` | Optional | `30d` | Token expiry duration |
| `CLIENT_URL` | Optional | `https://your-app.vercel.app` | Allowed CORS origin (comma-separated for multiples) |
| `CLOUDINARY_CLOUD_NAME` | Optional | `my-cloud` | Cloudinary for uploaded crop images |
| `CLOUDINARY_API_KEY` | Optional | `123456789` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Optional | `abcdef...` | Cloudinary Secret |

### Frontend Environment Variables
| Variable | Required? | Example / Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Optional | `https://api.example.com` | Base URL of deployed backend (leave empty for monolithic setup) |
