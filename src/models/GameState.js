const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  currentStage: {
    type: Number,
    default: 1,
  },
  score: {
    type: Number,
    default: 0,
  },
  lives: {
    type: Number,
    default: 3,
  },
  isPlaying: {
    type: Boolean,
    default: false,
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

module.exports = mongoose.models.GameState || mongoose.model('GameState', gameStateSchema); 