const mongoose = require('mongoose');

const platformEventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.PlatformEvent || mongoose.model('PlatformEvent', platformEventSchema); 