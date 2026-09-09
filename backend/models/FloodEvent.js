const mongoose = require('mongoose');

const floodEventSchema = new mongoose.Schema({
  serialNo: Number,
  date: String,
  locationLocal: String,
  locationDistrict: String,
  lossDescription: String,
  reference: String,
  deaths: Number,
  peopleMissing: Number,
  animalDeaths: Number,
  propertyLoss: Number,
}, {
  timestamps: true,
});

module.exports = mongoose.model('FloodEvent', floodEventSchema);
