require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const FloodEvent = require('./models/FloodEvent');

const CSV_PATH = path.join(__dirname, '..', 'data', 'flood-history', 'Uttarakhand_floods_1970_2025.csv');

function parseNumber(value) {
  const num = parseInt(String(value).trim(), 10);
  return Number.isNaN(num) ? 0 : num;
}

async function seedFloods() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error('Flood history dataset not found. Run: npm run download-data');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await FloodEvent.countDocuments();
  if (existing > 0) {
    console.log(`Flood history already seeded (${existing} events). Skipping.`);
    await mongoose.disconnect();
    return;
  }

  const events = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        const keys = Object.keys(row);
        events.push({
          serialNo: parseNumber(row['S.No.'] || row[keys[0]]),
          date: row.Date || '',
          locationLocal: row['Location(Local)'] || '',
          locationDistrict: row['Location(District)'] || '',
          lossDescription: row['Loss and damage(Words)'] || '',
          reference: row.Reference || '',
          deaths: parseNumber(row['Deaths(Numbers)']),
          peopleMissing: parseNumber(row['People Missing(Numbers)']),
          animalDeaths: parseNumber(row['Animal deaths(Numbers)']),
          propertyLoss: parseNumber(row['Property Loss(Numbers)']),
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  await FloodEvent.insertMany(events);
  console.log(`Seeded ${events.length} historical flood events (1970–2025)`);
  await mongoose.disconnect();
}

seedFloods().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
