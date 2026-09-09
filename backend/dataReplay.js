const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mqtt = require('mqtt');
const { mapEra5Row } = require('./utils/riskScore');

const CSV_PATH = path.join(__dirname, '..', 'data', 'era5-imerg', 'labeled_cloudburst.csv');
const INTERVAL_MS = parseInt(process.env.REPLAY_INTERVAL_MS || '2000', 10);
const BROKER = process.env.MQTT_BROKER || 'mqtt://test.mosquitto.org';
const TOPIC = 'jalrakshak/sensors';

const rows = [];
const client = mqtt.connect(BROKER);

client.on('connect', () => {
  console.log(`Data replay connected to ${BROKER}`);
  console.log(`Loading ERA5/IMERG dataset from ${CSV_PATH}`);

  if (!fs.existsSync(CSV_PATH)) {
    console.error('Dataset not found. Run: npm run download-data');
    process.exit(1);
  }

  fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (row) => rows.push(row))
    .on('end', () => {
      console.log(`Loaded ${rows.length} ERA5/IMERG records. Replaying every ${INTERVAL_MS}ms...`);
      let index = 0;

      setInterval(() => {
        const payload = mapEra5Row(rows[index % rows.length]);
        client.publish(TOPIC, JSON.stringify(payload), () => {
          const label = payload.cloudburstLabel ? ' [CLOUDBURST]' : '';
          console.log(
            `[${payload.timestamp.toISOString()}] rain=${payload.rainfall.toFixed(2)}mm rain_6h=${payload.rain6h.toFixed(2)}mm${label}`
          );
        });
        index += 1;
      }, INTERVAL_MS);
    })
    .on('error', (err) => {
      console.error('Failed to read dataset:', err.message);
      process.exit(1);
    });
});

client.on('error', (err) => {
  console.error('MQTT error:', err.message);
});
