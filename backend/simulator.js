const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', () => {
  console.log('Simulator connected to broker. Sending fake data...');
  
  const fakeData = {
    nodeId: 'sim-node-001',
    waterLevel: Math.floor(Math.random() * 100),
    blockageSeverity: 0.5,
    rainfall: 15,
    location: { lat: 30.4, lng: 79.1 }
  };

  client.publish('jalrakshak/sensors', JSON.stringify(fakeData), () => {
    console.log('Data sent:', fakeData);
    process.exit(0);
  });
});