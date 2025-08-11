const mongoose = require('mongoose');

const stageProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  stageNumber: {
    type: Number,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  bestScore: {
    type: Number,
    default: 0,
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

module.exports = mongoose.models.StageProgress || mongoose.model('StageProgress', stageProgressSchema); 