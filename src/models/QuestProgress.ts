import mongoose from 'mongoose';

const questProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  questId: {
    type: String,
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
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

// 복합 인덱스: userId와 questId의 조합이 유니크해야 함
questProgressSchema.index({ userId: 1, questId: 1 }, { unique: true });

export default mongoose.models.QuestProgress || mongoose.model('QuestProgress', questProgressSchema); 