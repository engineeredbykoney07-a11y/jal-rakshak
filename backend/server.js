require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const mqtt = require('mqtt');
const http = require('http');
const { Server } = require('socket.io');

const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: '*' }));
app.use(express.json());
const SensorReading = require('./models/SensorReading');
const FloodEvent = require('./models/FloodEvent');
const Subscriber = require('./models/Subscriber');
const { calculateRiskScore } = require('./utils/riskScore');
const { generateAdvisory } = require('./advisory');
const { sendSMS, maskPhone } = require('./sms');
const { sendIVR, sendTestCall } = require('./ivr');
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
      source: sensorData.source || 'era5-imerg',
      timestamp: sensorData.timestamp || new Date().toISOString()
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
          resident: `THERE IS DANGER COMING TO YOU!..PLEASE GO SOMEHWERE SAFE`,
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
        sendIVR(advisory.resident, sub.language, sub.phoneNumber, riskUpdatePayload.name, riskTier);
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

// IVR keypad response handler (Twilio posts here after press-1/press-2)
app.post('/api/ivr-response', (req, res) => {
  const digit = req.body.Digits;
  const twiml = new (require('twilio').twiml.VoiceResponse)();
  if (digit === '1') {
    twiml.say({ language: 'en-IN', voice: 'Polly.Raveena' },
      'Thank you for confirming. Please move to higher ground immediately and stay safe. Jal Rakshak will continue to monitor conditions.');
  } else if (digit === '2') {
    twiml.say({ language: 'en-IN', voice: 'Polly.Raveena' },
      'Emergency assistance has been noted. Please stay where you are. Rescue teams have been alerted to your location. Call 1 0 7 8 for immediate help.');
  } else {
    twiml.say({ language: 'en-IN', voice: 'Polly.Raveena' },
      'Invalid response. Please call 1 0 7 8 for the National Disaster helpline.');
  }
  res.type('text/xml');
  res.send(twiml.toString());
});

// Test call endpoint — fires a real call to TEST_PHONE_NUMBER
app.post('/api/test-call', async (req, res) => {
  const phone = req.body.phone || process.env.TEST_PHONE_NUMBER;
  if (!phone) return res.status(400).json({ error: 'No phone number. Set TEST_PHONE_NUMBER in .env or pass phone in body.' });
  try {
    const sid = await sendTestCall(phone);
    res.json({ success: true, sid, to: phone.slice(-4).padStart(phone.length, '*') });
  } catch (err) {
    // If Twilio trial restriction, explain clearly
    const isTrial = err.message?.includes('unverified') || err.message?.includes('trial');
    res.status(500).json({
      error: err.message,
      hint: isTrial
        ? 'Twilio trial accounts can only call verified numbers. Go to twilio.com/console > Phone Numbers > Verified Caller IDs and add your number.'
        : 'Check your Twilio credentials in .env'
    });
  }
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

    // Translate Hindi alerts to English using Gemini
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const translatedAlerts = await Promise.all(alerts.slice(0, 10).map(async (alert) => {
      try {
        const textToTranslate = alert.contentSnippet || alert.title || '';
        const titleToTranslate = alert.title || '';

        // Check if text contains Hindi/Devanagari characters
        const hasHindi = /[\u0900-\u097F]/.test(textToTranslate + titleToTranslate);
        if (!hasHindi) {
          return { ...alert, titleEn: titleToTranslate, contentSnippetEn: textToTranslate };
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
        const result = await model.generateContent(
          `Translate the following Indian government weather/disaster alert from Hindi to English. Return ONLY a JSON object with keys "title" and "content". Do not add any markdown or extra text.\n\nTitle: ${titleToTranslate}\nContent: ${textToTranslate}`
        );
        const raw = result.response.text().replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(raw);
        return { ...alert, titleEn: parsed.title, contentSnippetEn: parsed.content };
      } catch (e) {
        console.warn('[Translation] Failed for alert, using original:', e.message);
        return { ...alert, titleEn: alert.title, contentSnippetEn: alert.contentSnippet };
      }
    }));

    res.json(translatedAlerts);
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

// Demo endpoint: trigger the 4-message AI dispatch instantly
app.post('/api/demo-dispatch', async (req, res) => {
  const demoPayload = {
    id: 'demo-kedarnath',
    name: 'Kedarnath Valley, Uttarakhand',
    lang: 'hi',
    score: 82,
    tier: 'Evacuate',
    confidence: 'High',
    rainfall: 48.7,
    rain6h: 112.4,
    blockage: 'high',
  };
  try {
    const advisory = await generateAdvisory(demoPayload, { name: demoPayload.name, lang: demoPayload.lang });
    io.emit('advisoryUpdate', { id: demoPayload.id, advisory });
    res.json({ success: true, advisory });
  } catch (err) {
    // fallback
    const advisory = {
      resident: `⚠️ THERE IS DANGER COMING TO YOU! PLEASE GO SOMEWHERE SAFE. केदारनाथ घाटी में बाढ़ का खतरा है — अभी ऊँचाई पर जाएँ और ज़रूरी दस्तावेज़ साथ लें।`,
      officer: `EVACUATE tier detected at Kedarnath Valley. Risk Score: 82/100. Deploy rescue teams to NH-58, activate 3 relief camps at Sonprayag, Phata, and Guptkashi. Next check-in: 30 minutes.`,
      worker: `URGENT — Kedarnath Valley: Clear blocked culvert on NH-58 near Gaurikund (GPS: 30.65, 79.06). Use protective gear. Report blockage severity to ops centre every 15 mins.`,
      volunteer: `Go to the Ramesh Gusain household (no mobile phone) on the north side of Kedarnath bazaar. Knock firmly, explain in Hindi that flooding is imminent, and escort them to Sonprayag Relief Camp, 4km south.`
    };
    io.emit('advisoryUpdate', { id: demoPayload.id, advisory });
    res.json({ success: true, advisory, note: 'Fallback used — Gemini API unavailable' });
  }
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Jal Rakshak Server (API + WebSockets) running on http://localhost:${PORT}`);
    console.log('Datasets: ERA5/IMERG cloudburst + Uttarakhand flood history (1970–2025)');
  });
});
