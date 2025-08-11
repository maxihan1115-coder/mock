import mongoose from 'mongoose';

const platformEventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    enum: ['login', 'logout', 'stage_complete', 'quest_complete', 'score_update'],
    required: true,
  },
  eventData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  // 플랫폼 연동 상태
  platformEventId: {
    type: String,
    default: null,
  },
  isSentToPlatform: {
    type: Boolean,
    default: false,
  },
  sentToPlatformAt: {
    type: Date,
    default: null,
  },
  platformResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  retryCount: {
    type: Number,
    default: 0,
  },
  maxRetries: {
    type: Number,
    default: 3,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'retry'],
    default: 'pending',
  },
  errorMessage: {
    type: String,
    default: null,
  },
});

// 인덱스 추가
platformEventSchema.index({ userId: 1, timestamp: -1 });
platformEventSchema.index({ eventType: 1, status: 1 });
platformEventSchema.index({ isSentToPlatform: 1, status: 1 });

export default mongoose.models.PlatformEvent || mongoose.model('PlatformEvent', platformEventSchema); 