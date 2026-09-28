# 🩸 Raktam (रक्तम्) — Smart Blood Bank & Emergency Blood Availability System
**Project for Avishhkar**

Raktam is a full-stack, location-aware smart blood bank management and emergency blood donor matching platform.

---

## 🌟 Key Features Implemented

1. **Smart Radius-Based Blood Search**:
   - Searches local blood banks first.
   - Automatically expands search radius (5km → 10km → 25km → 50km → 100km) if blood isn't found locally.
2. **Emergency Blood Request & Instant Donor Matching**:
   - Immediate matching with registered eligible donors and blood banks in the area.
   - GPS-enabled coordinate search or city-level fallback.
3. **Real-Time Stock Updates & Emergency Alerts**:
   - Built with **Socket.io** for live stock broadcasts and emergency banner notifications.
4. **Donor Registration & Authentication**:
   - JWT authentication and bcrypt password hashing.
   - Donor profile dashboard, eligibility tracker (3-month cooldown period), and availability toggle.
5. **Blood Bank Directory**:
   - Complete directory with search, filtering, verified status, and real-time units for all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-).
6. **Admin Stock Management**:
   - Admin panel to update stock levels with instant real-time synchronization to users.
7. **Database Seeding**:
   - Auto-populates 10 major Indian blood centres across Mumbai, Delhi, Bengaluru, Chennai, Pune, Kolkata, Hyderabad, Ahmedabad, and sets up a default admin account.

---

## 📁 Project Structure

```
raktam/
├── client/                      # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/          # Navbar, Footer, EmergencyBanner, BloodTypeCard, StockOverview
│   │   ├── context/             # AuthContext, SocketContext (Socket.io)
│   │   ├── pages/               # Home, BloodSearch, EmergencyRequest, Login, Register, Dashboard, BloodBankDirectory, AdminDashboard, About
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                      # Node.js + Express + MongoDB Backend
│   ├── models/                  # User, BloodBank, EmergencyRequest, Donation
│   ├── routes/                  # auth, blood, emergency, donor, bank
│   ├── middleware/              # JWT auth & admin guard
│   ├── utils/                   # seed.js (pre-populated hospitals & stocks)
│   ├── .env                     # Database URI and Port configuration
│   ├── index.js                 # Express server + Socket.io handler
│   └── package.json
└── package.json                 # Root monorepo script
```

---

## 🚀 How to Run Raktam

### 1. Prerequisites
- **Node.js** (v18+ recommended): [Download Node.js](https://nodejs.org/)
- **MongoDB**: Either local MongoDB running at `mongodb://localhost:27017` or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster.

### 2. Configure MongoDB (Optional if using Atlas)
Open `server/.env` and replace `MONGODB_URI` with your connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/raktam?retryWrites=true&w=majority
```
*(By default, it is configured for local MongoDB: `mongodb://localhost:27017/raktam`)*

---

### 3. Install Dependencies & Start

#### Option A: Quick Start via Terminal

Open two terminal windows:

**Terminal 1 — Backend Server:**
```bash
cd server
npm install
npm run dev
```
> Server runs on `http://localhost:5000` (auto-seeds default banks & admin on first run).

**Terminal 2 — Frontend Client:**
```bash
cd client
npm install
npm run dev
```
> Frontend runs on `http://localhost:5173`. Open this URL in your browser!

---

## 🔑 Default Credentials
- **Admin Email**: `admin@raktam.in`
- **Admin Password**: `Raktam@2024`
*(Or register any new donor through the registration form)*
