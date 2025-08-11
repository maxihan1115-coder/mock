const mongoose = require('mongoose');

const questProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  questId: {
    type: Number,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.QuestProgress || mongoose.model('QuestProgress', questProgressSchema); 