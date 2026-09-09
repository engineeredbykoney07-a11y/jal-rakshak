const mqtt = require('mqtt');
require('dotenv').config();

const client = mqtt.connect(process.env.MQTT_BROKER || 'mqtt://test.mosquitto.org');

const locations = [
  { nodeId: 'ridgeroad', locationName: 'Ridge Road, Uttarkashi', lang: 'hi', location: { lat: 30.73, lng: 78.45 } },
  { nodeId: 'secunderabad', locationName: 'Secunderabad', lang: 'te', location: { lat: 17.4399, lng: 78.4983 } }
];

client.on('connect', () => {
  console.log('Simulator connected to MQTT. Publishing demo readings...');
  
  setInterval(() => {
    locations.forEach(loc => {
      // Generate some fake high-risk data randomly
      const isHighRisk = Math.random() > 0.7;
      const payload = {
        nodeId: loc.nodeId,
        locationName: loc.locationName,
        lang: loc.lang,
        location: loc.location,
        timestamp: new Date().toISOString(),
        waterLevel: isHighRisk ? Math.random() * 50 + 50 : Math.random() * 30, // 50-100 or 0-30
        blockageSeverity: isHighRisk ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3,
        rainfall: isHighRisk ? Math.random() * 20 + 10 : Math.random() * 5,
        rain6h: isHighRisk ? Math.random() * 50 + 20 : Math.random() * 10,
        cloudburstLabel: isHighRisk && Math.random() > 0.8 ? 1 : 0,
        source: 'simulator'
      };
      
      client.publish('jalrakshak/sensors', JSON.stringify(payload));
      console.log(`Published reading for ${loc.nodeId}`);
    });
  }, 10000); // Every 10 seconds
});
