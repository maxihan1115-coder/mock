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
  // 연결 관련 필드들 추가
  isConnected: {
    type: Boolean,
    default: false,
  },
  connectedAt: {
    type: Date,
    default: null,
  },
  disconnectedAt: {
    type: Date,
    default: null,
  },
  connectionData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
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