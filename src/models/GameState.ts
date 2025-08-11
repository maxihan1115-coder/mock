import mongoose from 'mongoose';

const gameStateSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
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
  isPaused: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // 플랫폼 연동 관련 필드들
  platformEventId: {
    type: String,
    default: null,
  },
  lastPlatformEvent: {
    type: String,
    enum: ['login', 'logout', 'stage_complete', 'quest_complete', 'score_update'],
    default: null,
  },
  platformEventData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  platformSyncRequired: {
    type: Boolean,
    default: false,
  },
  platformSyncAttempts: {
    type: Number,
    default: 0,
  },
  lastPlatformSyncAttempt: {
    type: Date,
    default: null,
  },
});

export default mongoose.models.GameState || mongoose.model('GameState', gameStateSchema); 