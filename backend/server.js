require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');

const app = express();
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// Simple test route
app.get('/', (req, res) => {
  res.send('FloodTracker backend is running');
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});