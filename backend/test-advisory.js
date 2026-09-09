require('dotenv').config();
const { generateAdvisory } = require('./advisory');

async function test() {
  const risk = {
    tier: 'Evacuate',
    score: 85,
    confidence: 'High',
    level: 72,
    blockage: 'partial'
  };
  const location = {
    name: 'Ridge Road, Uttarkashi',
    lang: 'hi'
  };

  console.log('Generating advisory...');
  const advisory = await generateAdvisory(risk, location);
  console.log(JSON.stringify(advisory, null, 2));
}

test();
