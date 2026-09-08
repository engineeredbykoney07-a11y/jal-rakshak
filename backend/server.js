require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const mqtt = require('mqtt');
const http = require('http'); // New: required for Socket.io
const { Server } = require('socket.io'); // New: Socket.io server

const app = express();
// Create the HTTP server and attach Socket.io with permissive CORS for local dev
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.json());
const SensorReading = require('./models/SensorReading');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected (Jal Rakshak DB)');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// Connect to Mosquitto Broker
const mqttClient = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

mqttClient.on('connect', () => {
  console.log('Connected to Mosquitto MQTT broker');
  mqttClient.subscribe('jalrakshak/sensors', (err) => {
    if (!err) console.log('Subscribed to topic: jalrakshak/sensors');
  });
});
mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err.message);
});

mqttClient.on('offline', () => {
  console.log('MQTT client went offline — retrying...');
});

// Socket.io Connection Log
io.on('connection', (socket) => {
  console.log(`New frontend client connected: ${socket.id}`);
});

// Ingestion & Risk Scoring
mqttClient.on('message', async (topic, message) => {
  try {
    const sensorData = JSON.parse(message.toString());

    // Weights: W1=0.4 (Rainfall), W2=0.4 (Water Level), W3=0.2 (Blockage)
    const w1 = 0.4, w2 = 0.4, w3 = 0.2;
    const normRain = Math.min((sensorData.rainfall / 50) * 100, 100);
    const normWater = Math.min((sensorData.waterLevel / 100) * 100, 100);
    const normBlockage = sensorData.blockageSeverity * 100;

    const riskScore = Number(((w1 * normRain) + (w2 * normWater) + (w3 * normBlockage)).toFixed(2));

    let riskTier = 'Low';
    if (riskScore > 75) riskTier = 'Critical';
    else if (riskScore > 50) riskTier = 'Warning';

    console.log(`\n--- [Jal Rakshak] New Reading ---`);
    console.log(`Calculated Risk Score: ${riskScore} / 100`);
    console.log(`Current Risk Tier: ${riskTier}`);

    const reading = new SensorReading({
      nodeId: sensorData.nodeId,
      waterLevel: sensorData.waterLevel,
      blockageSeverity: sensorData.blockageSeverity,
      rainfall: sensorData.rainfall,
      riskScore: riskScore,
      riskTier: riskTier,
      location: sensorData.location,
    });

    const saved = await reading.save();
    console.log('Saved to Jal Rakshak DB:', saved._id);
    
    // LIVE UPDATE: Push this new reading to the React dashboard instantly!
    io.emit('new-reading', saved);

    console.log(`---------------------------------\n`);
  } catch (err) {
    console.error('Error processing MQTT message:', err.message);
  }
});

// --- REST APIs for the Dashboard ---

// 1. Health check route
app.get('/', (req, res) => {
  res.send('Jal Rakshak backend is running');
});

// 2. Fetch recent readings for map initialization
app.get('/api/readings', async (req, res) => {
  try {
    // Fetch the 50 most recent readings to populate the dashboard map
    const readings = await SensorReading.find().sort({ createdAt: -1 }).limit(50);
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

const PORT = process.env.PORT || 5000;

// IMPORTANT: Start the `server`, not the `app`, so Socket.io binds correctly
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Jal Rakshak Server (API + WebSockets) running on http://localhost:${PORT}`);
  });
});