import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  uuid: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  // 내부 플랫폼 연동 관련 필드들
  platformId: {
    type: Number,
    default: null,
  },
  memberId: {
    type: Number,
    default: null,
  },
  bappId: {
    type: Number,
    default: null,
  },
  platformUuid: {
    type: String,
    default: null,
  },
  joinedAt: {
    type: Date,
    default: null,
  },
  isPlatformLinked: {
    type: Boolean,
    default: false,
  },
  platformLinkedAt: {
    type: Date,
    default: null,
  },
});

export default mongoose.models.User || mongoose.model('User', userSchema); 