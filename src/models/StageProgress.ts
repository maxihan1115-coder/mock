import mongoose from 'mongoose';

const stageProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  stageId: {
    type: Number,
    required: true,
  },
  isUnlocked: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 복합 인덱스: userId와 stageId의 조합이 유니크해야 함
stageProgressSchema.index({ userId: 1, stageId: 1 }, { unique: true });

export default mongoose.models.StageProgress || mongoose.model('StageProgress', stageProgressSchema); 