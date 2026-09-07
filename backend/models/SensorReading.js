const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
  },
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
  riskScore: {
    type: Number,
    default: 0,
  },
  riskTier: {
    type: String,
    enum: ['Low', 'Warning', 'Critical'],
    default: 'Low',
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('SensorReading', sensorReadingSchema);