# 🚀 SkillSwap — How to Run & Start Guide

This guide contains all commands and steps needed to run the SkillSwap project on Windows PowerShell.

---

## 📌 Current Status

Both servers are **already running and active**:

| Service | URL | Status |
|---|---|---|
| **Frontend** | [http://localhost:5173](http://localhost:5173) | 🟢 Active |
| **Backend API** | [http://localhost:5000](http://localhost:5000) | 🟢 Active |
| **API Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | 🟢 Healthy |

You can open **[http://localhost:5173](http://localhost:5173)** in your browser right now!

---

## ⚠️ Why You Got `Error: listen EADDRINUSE :::5000`

When you ran `npm run dev` in PowerShell, the error `EADDRINUSE: address already in use :::5000` occurred because **the backend was already running in the background and listening on port 5000**.

### How to Free Port 5000 (If it ever gets locked)
If port 5000 is ever locked by an old background process in PowerShell, run:
```powershell
# Find and stop process using port 5000:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force

# Or using npx kill-port:
npx kill-port 5000
```

---

## 🛠️ Step-by-Step Commands to Run the Project

When starting from a fresh terminal session, open two PowerShell tabs:

### 1️⃣ Terminal 1 — Backend (API & WebSockets)

```powershell
cd C:\Users\itsmy\skill\skillswap\backend
npm run dev
```

> **Expected output:**
> ```
> ✅ MongoDB Connected: cluster0...
> ✅ Default platform settings seeded
> 🚀 SkillSwap API Server
>    Environment: development
>    Port: 5000
>    Frontend: http://localhost:5173
>    Health: http://localhost:5000/api/health
>    Socket.IO: Enabled
> ```

---

### 2️⃣ Terminal 2 — Frontend (Vite + React)

```powershell
cd C:\Users\itsmy\skill\skillswap\frontend
npm run dev
```

> **Expected output:**
> ```
>   VITE v8.3.4  ready in 361 ms
>   ➜  Local:   http://localhost:5173/
> ```

---

## 🔐 Default Admin & Demo Credentials

When the database is connected, default settings and seed data are initialized automatically:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@skillswap.com` | `Admin@123456` |
| **New Users** | Sign up via `/register` | Minimum 8 characters |

---

## 📁 Environment Configuration Summary

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://skillswap_admin:Swathika%401911@cluster0.gnmy7om.mongodb.net/skillswap?retryWrites=true&w=majority
JWT_SECRET=skillswap_super_secret_jwt_key_change_in_production_2026
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```
*(Note: The `@` in the MongoDB password is URL-encoded as `%40`)*

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=SkillSwap
```

---

## 🧪 Quick Health Checks

To test the servers via PowerShell:

```powershell
# Test Backend Health:
Invoke-RestMethod -Uri http://localhost:5000/api/health

# Test Frontend:
Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing | Select-Object StatusCode
```
