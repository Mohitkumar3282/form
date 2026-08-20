# 🚗 Customer Vehicle Registration (Admin Secured)

This full-stack application features a **Public Customer Vehicle Registration Form** linked by **QR Code**, and a **Restricted Admin Dashboard** for viewing and managing stored customer records.

---

## 🔒 Admin Access Control

- **Public Features**: Anyone scanning the QR code or visiting `http://localhost:3000` can register their vehicle details and generate/copy QR links.
- **Protected Admin Features**: Access to `GET /api/customers` and `DELETE /api/customers/:id` is restricted by **Admin Passcode Security**.
- **Default Admin Passcode**: `admin123` *(Configurable in `.env` via `ADMIN_PASSWORD`)*.

---

## ⚡ Server Configuration

| Component | Directory | Server Port | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend API** | `backend/` | `http://localhost:5000` | REST API (`/api/customers`), Admin Auth Middleware, MongoDB Atlas Connection |
| **Frontend UI** | `frontend/` | `http://localhost:3000` | Web Interface with Admin Lock Screen & Passcode Verification |

---

## 🚀 How to Run

### Step 1: Start Backend API Server (Terminal 1)
```bash
cd backend
npm start
```

### Step 2: Start Frontend Web UI (Terminal 2)
```bash
cd frontend
npm start
```

### Step 3: Access App & Unlock Admin Records
1. Open **`http://localhost:3000`** in your browser.
2. Click the **"🔒 Admin Records"** tab.
3. Enter the Admin Passcode: **`admin123`**
4. Click **Unlock Records Dashboard** to view, search, export to CSV, or delete customer records.
