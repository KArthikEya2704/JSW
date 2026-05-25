const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // ✅ ADDED
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const dprRoutes = require('./routes/dpr');
const ticketRoutes = require('./routes/tickets'); // ✅ ADDED

app.use('/api/auth', authRoutes);
app.use('/api/dpr', dprRoutes);
app.use('/api/tickets', ticketRoutes); // ✅ ADDED

// Health check route
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    server: 'running',
    database: states[dbState] || 'unknown',
    dbReady: dbState === 1
  });
});

// ✅ SERVE FRONTEND (VERY IMPORTANT)
app.use(express.static(path.join(__dirname, "../dist")));

app.get("*all", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Database Connection
const User = require('./models/User');

const seedAdminUserOnStartup = async () => {
  try {
    const existingUser = await User.findOne({ username: 'admin' });
    if (existingUser) {
      console.log("🌱 Admin user check: already exists.");
      return;
    }

    const adminUser = new User({
      username: 'admin',
      password: 'jsw@2027',
      name: 'Admin User',
      role: 'Administrator'
    });

    await adminUser.save();
    console.log("✅ Admin user successfully seeded on startup!");
  } catch (error) {
    console.error("❌ Error seeding admin user on startup:", error.message);
  }
};

const connectDB = async () => {
  try {
    console.log("📡 Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Atlas connected!");
    
    // Auto-seed default admin account (free tier friendly)
    await seedAdminUserOnStartup();
  } catch (err) {
    console.error("❌ MongoDB Atlas connection failed:", err.message);
  }
};

connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});