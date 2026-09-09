require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const mqtt = require('mqtt');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(express.json());
const SensorReading = require('./models/SensorReading');
const FloodEvent = require('./models/FloodEvent');
const Subscriber = require('./models/Subscriber');
const { calculateRiskScore } = require('./utils/riskScore');
const { generateAdvisory } = require('./advisory');
const { sendSMS, maskPhone } = require('./sms');
const { sendIVR } = require('./ivr');
const { fetchCapFeed } = require('./sachetFeed');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected (Jal Rakshak DB)');
  } catch (err) {
    console.error('MongoDB connection error (Starting in DB-less mode):', err.message);
  }
}

const mqttClient = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://test.mosquitto.org');

mqttClient.on('connect', () => {
  console.log('Connected to Mosquitto MQTT broker');
  mqttClient.subscribe('jalrakshak/sensors', (err) => {
    if (!err) console.log('Subscribed to topic: jalrakshak/sensors');
  });
});

io.on('connection', (socket) => {
  console.log(`New frontend client connected: ${socket.id}`);
});

mqttClient.on('message', async (topic, message) => {
  try {
    const sensorData = JSON.parse(message.toString());
    const { riskScore, riskTier, confidence } = calculateRiskScore(sensorData);

    console.log('\n--- [Jal Rakshak] New Reading ---');
    console.log(`Source: ${sensorData.source || 'unknown'}`);
    console.log(`Rainfall: ${sensorData.rainfall?.toFixed?.(4) ?? sensorData.rainfall} mm | 6h: ${sensorData.rain6h?.toFixed?.(4) ?? sensorData.rain6h} mm`);
    console.log(`Cloudburst label: ${sensorData.cloudburstLabel ?? 0}`);
    console.log(`Calculated Risk Score: ${riskScore} / 100`);
    console.log(`Current Risk Tier: ${riskTier} (${confidence} Confidence)`);

    // Build the exact data contract
    const riskUpdatePayload = {
      id: sensorData.nodeId || 'unknown',
      name: sensorData.locationName || 'Unknown Location',
      lang: sensorData.lang || 'en',
      coords: [sensorData.location?.lat || 0, sensorData.location?.lng || 0],
      level: sensorData.waterLevel || 0,
      blockage: sensorData.blockageSeverity > 0.5 ? 'high' : (sensorData.blockageSeverity > 0 ? 'partial' : 'none'),
      score: riskScore,
      tier: riskTier,
      confidence: confidence,
      // Enriched sensor fields
      rainfall: sensorData.rainfall || 0,
      rain6h: sensorData.rain6h || 0,
      soilMoisture: sensorData.soilMoisture || (Math.random() * 60 + 20).toFixed(1), // simulated if not present
      slope: sensorData.slope || (sensorData.location?.lat ? (15 + Math.random() * 35).toFixed(1) : 'N/A'), // degrees
      elevation: sensorData.elevation || (sensorData.location?.lat ? Math.round(800 + Math.random() * 1200) : 'N/A'), // metres
      area: sensorData.locationName || 'Unknown Area',
    };

    io.emit('riskUpdate', riskUpdatePayload);

    const reading = new SensorReading({
      nodeId: sensorData.nodeId,
      timestamp: sensorData.timestamp ? new Date(sensorData.timestamp) : new Date(),
      temperature: sensorData.temperature,
      windU: sensorData.windU,
      windV: sensorData.windV,
      windSpeed: sensorData.windSpeed,
      surfacePressure: sensorData.surfacePressure,
      waterVapour: sensorData.waterVapour,
      totalPrecipitation: sensorData.totalPrecipitation,
      waterLevel: sensorData.waterLevel,
      blockageSeverity: sensorData.blockageSeverity,
      rainfall: sensorData.rainfall,
      rain3h: sensorData.rain3h,
      rain6h: sensorData.rain6h,
      rainPeak3h: sensorData.rainPeak3h,
      cloudburstLabel: sensorData.cloudburstLabel,
      source: sensorData.source || 'era5-imerg',
      riskScore,
      riskTier,
      confidence,
      location: sensorData.location,
    });

    try {
      if (mongoose.connection.readyState === 1) {
        const saved = await reading.save();
        console.log('Saved to Jal Rakshak DB:', saved._id);
      }
    } catch(dbErr) {
      console.log('Skipping DB save (MongoDB offline)');
    }

    if (riskTier === 'Warning' || riskTier === 'Evacuate') {
      console.log(`\n>>> TRIGGERING DISPATCH FOR ${riskTier} <<<`);

      // Step 1: Generate advisory (independently, so failure doesn't block SMS)
      let advisory = null;
      try {
        advisory = await generateAdvisory(riskUpdatePayload, { name: riskUpdatePayload.name, lang: riskUpdatePayload.lang });
        console.log('[Advisory] Generated successfully.');
        io.emit('advisoryUpdate', { id: riskUpdatePayload.id, advisory });
      } catch (advisoryErr) {
        console.error('[Advisory] Failed to generate (check GEMINI_API_KEY in .env):', advisoryErr.message);
        // Fallback advisory in English so SMS still goes out
        advisory = {
          resident: `Flood risk alert for ${riskUpdatePayload.name}. Risk tier: ${riskTier}. Please take precautions immediately.`,
          officer: `Risk tier ${riskTier} detected at ${riskUpdatePayload.name}. Score: ${riskUpdatePayload.score}/100. Coordinate response.`,
          worker: `Proceed to ${riskUpdatePayload.name} for emergency assessment. Tier: ${riskTier}.`,
          volunteer: `Check on residents near ${riskUpdatePayload.name} who may not have phones. Tier: ${riskTier}.`
        };
        io.emit('advisoryUpdate', { id: riskUpdatePayload.id, advisory });
      }

      // Step 2: Fetch subscribers and send alerts
      let subscribers = [];
      try {
        subscribers = await Subscriber.find({ locationId: riskUpdatePayload.id });
      } catch (dbErr) {
        console.log('[SMS] MongoDB offline, using TEST_PHONE_NUMBER only.');
      }

      // Add test phone from env as fallback demo
      if (process.env.TEST_PHONE_NUMBER) {
        subscribers.push({
          phoneNumber: process.env.TEST_PHONE_NUMBER,
          language: riskUpdatePayload.lang,
          locationId: riskUpdatePayload.id
        });
      }

      if (subscribers.length === 0) {
        console.log('[SMS] No subscribers found. Set TEST_PHONE_NUMBER in .env to test.');
      }

      for (const sub of subscribers) {
        console.log(`[SMS] Dispatching to ${maskPhone(sub.phoneNumber)} in ${sub.language}...`);
        // Fire both in parallel without awaiting (non-blocking)
        sendSMS(advisory.resident, riskUpdatePayload.name, sub.phoneNumber);
        sendIVR(advisory.resident, sub.language, sub.phoneNumber);
      }
    }

    console.log('---------------------------------\n');
  } catch (err) {
    console.error('Error processing MQTT message:', err.message);
  }
});

app.get('/', (req, res) => {
  res.send('Jal Rakshak backend is running (ERA5/IMERG + Uttarakhand flood history datasets)');
});

app.get('/api/readings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const readings = await SensorReading.find().sort({ timestamp: -1 }).limit(limit);
    res.json(readings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch readings' });
  }
});

app.post('/api/subscribe', async (req, res) => {
  try {
    const { phoneNumber, locationId, language, consentGiven } = req.body;
    if (!consentGiven) {
      return res.status(400).json({ error: 'Consent is required' });
    }
    // Try to save to DB, but succeed even if MongoDB is offline
    if (mongoose.connection.readyState === 1) {
      const newSub = new Subscriber({ phoneNumber, locationId, language, consentGiven });
      await newSub.save();
      console.log(`[Subscribe] Saved to DB: ${phoneNumber}`);
    } else {
      console.log(`[Subscribe] DB offline — TEST_PHONE_NUMBER will be used for alerts.`);
    }
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('[Subscribe] Error:', err.message);
    res.status(500).json({ error: 'Subscription failed' });
  }
});

app.get('/api/official-alerts', async (req, res) => {
  try {
    const stateCode = req.query.state || 'uttarakhand';
    const alerts = await fetchCapFeed(stateCode);
    res.json(alerts);
  } catch (err) {
    console.error('Error fetching official alerts:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.get('/api/flood-history', async (req, res) => {
  try {
    const events = await FloodEvent.find().sort({ serialNo: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch flood history' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const [totalReadings, cloudburstCount, floodEvents, criticalCount] = await Promise.all([
      SensorReading.countDocuments(),
      SensorReading.countDocuments({ cloudburstLabel: 1 }),
      FloodEvent.countDocuments(),
      SensorReading.countDocuments({ riskTier: 'Evacuate' }),
    ]);

    res.json({
      totalReadings,
      cloudburstEvents: cloudburstCount,
      historicalFloodEvents: floodEvents,
      criticalReadings: criticalCount,
      datasets: {
        era5Immerg: 'labeled_cloudburst.csv (2005–2024, hourly)',
        floodHistory: 'Uttarakhand_floods_1970_2025.csv (252 events)',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Jal Rakshak Server (API + WebSockets) running on http://localhost:${PORT}`);
    console.log('Datasets: ERA5/IMERG cloudburst + Uttarakhand flood history (1970–2025)');
  });
});
