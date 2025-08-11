const express = require('express');
const router = express.Router();
const dbConnect = require('../lib/mongodb');
const AttendanceModel = require('../models/Attendance');

// 출석 체크
router.post('/check', async (req, res) => {
  try {
    await dbConnect();
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다.',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘 출석 기록 확인
    const attendance = await AttendanceModel.findOne({
      userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (attendance) {
      return res.status(400).json({
        success: false,
        error: '오늘 이미 출석했습니다.',
      });
    }

    // 출석 기록 생성
    const newAttendance = await AttendanceModel.create({
      userId,
      date: new Date(),
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      data: newAttendance,
      message: '출석이 완료되었습니다!',
    });
  } catch (error) {
    console.error('Attendance check error:', error);
    return res.status(500).json({
      success: false,
      error: '출석 체크 중 오류가 발생했습니다.',
    });
  }
});

// 출석 상태 조회
router.get('/status', async (req, res) => {
  try {
    await dbConnect();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다.',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 오늘 출석 기록 확인
    const todayAttendance = await AttendanceModel.findOne({
      userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // 이번 주 출석 기록 조회
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weekAttendance = await AttendanceModel.find({
      userId,
      date: {
        $gte: weekStart,
        $lt: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    }).sort({ date: 1 });

    // 이번 달 출석 기록 조회
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthAttendance = await AttendanceModel.find({
      userId,
      date: {
        $gte: monthStart,
        $lt: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1)
      }
    }).sort({ date: 1 });

    return res.json({
      success: true,
      data: {
        todayChecked: !!todayAttendance,
        weekCount: weekAttendance.length,
        monthCount: monthAttendance.length,
        weekAttendance: weekAttendance.map(a => a.date),
        monthAttendance: monthAttendance.map(a => a.date),
      },
    });
  } catch (error) {
    console.error('Attendance status error:', error);
    return res.status(500).json({
      success: false,
      error: '출석 상태 조회 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router; 