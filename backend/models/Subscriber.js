const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  locationId: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'te'],
    default: 'en',
  },
  consentGiven: {
    type: Boolean,
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
