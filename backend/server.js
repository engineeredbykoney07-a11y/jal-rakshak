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
function generateAdvisory(sensorData, riskScore, riskTier) {
  const { nodeId, waterLevel, blockageSeverity } = sensorData;

  const messages = {
    worker: `[${riskTier}] Node ${nodeId}: Water level ${waterLevel}cm, blockage severity ${blockageSeverity}. ${
      riskTier === 'Critical'
        ? 'Clear the drainage point immediately and report status.'
        : 'Inspect and clear blockage at earliest opportunity.'
    }`,
    resident: `[${riskTier}] Flood risk near your area (score ${riskScore}/100). ${
      riskTier === 'Critical'
        ? 'Move to higher ground now and avoid the river path.'
        : 'Stay alert and avoid low-lying areas nearby.'
    }`,
    officer: `[${riskTier}] Node ${nodeId} reporting risk score ${riskScore}/100. Water level ${waterLevel}cm. ${
      riskTier === 'Critical'
        ? 'Recommend dispatching evacuation support to this zone.'
        : 'Monitor closely, prepare response team if risk escalates.'
    }`,
    volunteer: `[${riskTier}] Node ${nodeId} at elevated risk. ${
      riskTier === 'Critical'
        ? 'Report to coordination point immediately for evacuation assistance.'
        : 'Stand by near the affected zone for possible mobilization.'
    }`,
  };

  return messages;
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

let advisory = null;
if (riskTier === 'Warning' || riskTier === 'Critical') {
  advisory = generateAdvisory(sensorData, riskScore, riskTier);
  console.log('Advisory generated:', advisory);
}

io.emit('new-reading', { ...saved.toObject(), advisory });

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