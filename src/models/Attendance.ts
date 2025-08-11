import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  attendanceDate: {
    type: String, // YYYY-MM-DD 형식
    required: true,
  },
  attendedAt: {
    type: Date,
    default: Date.now,
  },
  consecutiveDays: {
    type: Number,
    default: 1,
  },
  totalDays: {
    type: Number,
    default: 1,
  },
  rewards: {
    experience: {
      type: Number,
      default: 0,
    },
    coins: {
      type: Number,
      default: 0,
    },
    items: [{
      itemId: String,
      quantity: Number,
    }],
  },
});

// 복합 인덱스: userId와 attendanceDate의 조합이 유니크해야 함
attendanceSchema.index({ userId: 1, attendanceDate: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);