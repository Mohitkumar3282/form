# 🚀 Complete Deployment Guide for Customer Vehicle Registration App

Your application is **100% production-ready** and configured for instant cloud deployment. Below are step-by-step instructions for deploying to **Render.com** (Recommended — Free), **Vercel**, or **Railway**.

---

## 🌟 Option 1: Deploy on Render.com (Recommended - Free Web Service)

Render allows you to host the entire Node.js server and Frontend UI together for free in **3 simple steps**:

### Step 1: Push Code to GitHub / GitLab
1. Initialize git in your project directory (if not already initialized):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for production deployment"
   ```
2. Push your project repository to GitHub or GitLab.

---

### Step 2: Create a New Web Service on Render
1. Log in to [Render.com](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub/GitLab repository.
4. Fill in the following settings:
   - **Name**: `customer-vehicle-app` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

---

### Step 3: Add Environment Variables on Render
Scroll down to the **Environment Variables** section and add:

| Key | Value |
| :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://theshinelounge1_db_user:Mohit1@cluster0.mem5qqj.mongodb.net/customer_db?retryWrites=true&w=majority` |
| `ADMIN_PASSWORD` | `admin123` *(or your custom admin passcode)* |

Click **Create Web Service**!
 Render will build your app and give you a live URL like:
👉 **`https://customer-vehicle-app.onrender.com`**

---

## 🚂 Option 2: Deploy on Railway.app

1. Sign up at [Railway.app](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Go to **Variables** tab and add:
   - `MONGODB_URI` = `mongodb+srv://theshinelounge1_db_user:Mohit1@cluster0.mem5qqj.mongodb.net/customer_db?retryWrites=true&w=majority`
   - `ADMIN_PASSWORD` = `admin123`
5. Railway will automatically build and assign a live URL!

---

## ⚡ Option 3: Deploy Frontend on Vercel & Backend on Render

If you prefer to deploy frontend and backend separately:

### 1. Backend (Render):
- Deploy `backend/` directory on Render as a Web Service.
- Set environment variables (`MONGODB_URI`, `ADMIN_PASSWORD`, `FRONTEND_URL`).

### 2. Frontend (Vercel):
- Deploy `frontend/` directory on [Vercel](https://vercel.com).
- Update `API_BASE_URL` in `frontend/public/js/app.js` to point to your backend Render URL (`https://your-backend.onrender.com`).

---

## 🔒 Pre-Deployment Security Check

Make sure your **MongoDB Atlas Network Access** allows connections from anywhere:
1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Go to **Network Access** under Security.
3. Ensure **IP Access List** includes `0.0.0.0/0` (Allow Access from Anywhere) so hosting platforms like Render or Railway can connect to your database.
