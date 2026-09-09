const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
  },
  timestamp: Date,
  temperature: Number,
  windU: Number,
  windV: Number,
  windSpeed: Number,
  surfacePressure: Number,
  waterVapour: Number,
  totalPrecipitation: Number,
  waterLevel: {
    type: Number,
    required: true,
  },
  blockageSeverity: {
    type: Number,
    required: true,
  },
  rainfall: {
    type: Number,
    default: 0,
  },
  rain3h: Number,
  rain6h: Number,
  rainPeak3h: Number,
  cloudburstLabel: Number,
  source: {
    type: String,
    default: 'era5-imerg',
  },
  riskScore: {
    type: Number,
    default: 0,
  },
  riskTier: {
    type: String,
    enum: ['Normal', 'Watch', 'Warning', 'Evacuate'],
    default: 'Normal',
  },
  confidence: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SensorReading', sensorReadingSchema);
