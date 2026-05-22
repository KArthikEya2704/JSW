# JSW Township DPR Dashboard 🚀

A premium, state-of-the-art Web Application designed for **JSW Township** to parse, store, and visualize the **Daily Progress Reports (DPR)**. Built as a single-host application featuring a highly responsive React client and a robust Node/Express server backed by MongoDB Atlas.

---

## 🎨 Design & Aesthetic System

The application is styled with a custom **Material Design 2 (MD2)** dark aesthetic.
- **Color Palette**: Sophisticated HSL colors featuring JSW Steel Blue backdrop overlays, premium dark surfaces, dynamic muted grey typography, and vibrant red accents (`var(--accent)`).
- **Smooth Animations**: Interactive charts and overlays powered by `framer-motion` and micro-animations for cards and hover selectors.
- **Glassmorphism**: Translucent headers, loaders, and indicators utilizing native `backdrop-filter: blur()`.

---

## ⚡ Key Features

1. **Interactive Excel DPR Data Ingestion**
   - Drag-and-drop or select standard Daily Progress Report spreadsheets (`.xlsx`, `.xls`, `.csv`).
   - Automated server-side Excel parser that extracts multiple worksheets (Guest House, Meals, Manpower, Vehicles, Maintenance, Painting).
2. **Dynamic Data Visualizations**
   - High-fidelity interactive Recharts displaying room availability, canteen meal distributions, vehicle distances, paint targets, and work progress.
   - Smooth horizontal/vertical layouts and radial pie indicators with hover tooltips.
3. **Historical Navigation**
   - Retroactive search and navigation calendar to quickly view or filter reports submitted on past dates.
4. **Secure Authentication**
   - Role-based profile badges (Administrator, Manager, User) and JWT-signed authorization gates.
5. **Zero-Config 100% Free Production Deployment**
   - Built-in Render Blueprint (`render.yaml`) and database auto-seeding on startup for seamless public hosting.

---

## 📁 Repository Structure

```text
JSW/
├── backend/                  # Node.js + Express Backend API Server
│   ├── models/               # MongoDB Mongoose Schemas (User, DprReport)
│   ├── routes/               # API Routes (Authentication, DPR Processing)
│   ├── utils/                # Spreadsheet Parsing Logic
│   ├── server.js             # Express Entry Point (serves static dist/ client)
│   └── package.json          # Backend Node Dependencies
├── src/                      # Vite + React Frontend Application
│   ├── components/           # Protected routes and reusable UI panels
│   ├── context/              # Context Providers (Authentication State)
│   ├── pages/                # Main Visualizer Panels & Login screens
│   ├── index.css             # Unified modern CSS theme variables & styles
│   └── main.jsx              # Client entry point
├── public/                   # Static browser assets (Logos, Icons)
├── render.yaml               # Render Infrastructure-as-Code Blueprint
├── vite.config.js            # Vite configuration & dev proxy
└── package.json              # Root project configurations and scripts
```

---

## 🛠️ Local Development Quick Start

### 1. Prerequisites
- **Node.js** (v20+ recommended)
- **MongoDB** (Local instance or Cloud Atlas cluster)

### 2. Configure Environment Variables
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/jsw_db
JWT_SECRET=your_super_secret_signing_key_here
```

### 3. Install & Start

#### Run the Backend Server
```bash
cd backend
npm install
npm start
```

#### Run the Frontend Client (Vite Dev Server)
In a new terminal window in the root directory:
```bash
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. The Vite server automatically proxies `/api` requests to the Express backend running on port `5000`.

---

## 🚀 Deploying to Render (Free Tier Friendly)

This project is configured with a unified **Render Blueprint** (`render.yaml`) which mounts both front-end and back-end on a single port for **100% free hosting**.

### 1. Configure MongoDB Atlas Network Access
> [!IMPORTANT]
> Because Render free instances utilize dynamic IP addresses, you must whitelist connections from all entry points in your MongoDB Atlas cluster.
- Go to MongoDB Atlas Console -> **Security** -> **Network Access**.
- Click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`) -> Click **Confirm**.

### 2. Deploy the Blueprint
1. Push this repository to your GitHub account.
2. Log into the **[Render Dashboard](https://dashboard.render.com/)**.
3. Click **New** -> **Blueprint**.
4. Connect your JSW repository.
5. Provide your **`MONGODB_URI`** connection string when prompted in the environment settings form.
6. Click **Approve / Deploy**.

### 3. Automatic Seeding
- Unlike normal deployments that require paid interactive shell access, **the server will automatically detect an empty database and seed the default administrator credentials on the very first boot!**

---

## 🔑 Default Administrator Credentials

Once deployed or running locally, log in using:
- **Username**: `admin`
- **Password**: `jsw@2024`

---

## 📦 Production Build Verification
To manually compile and package the React frontend into the production `dist/` bundle:
```bash
npm run build
```
The Node backend is hardwired to serve these static files natively, making production hosting lightweight and highly performant.
