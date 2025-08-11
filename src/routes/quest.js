const express = require('express');
const router = express.Router();
const dbConnect = require('../lib/mongodb');
const QuestProgressModel = require('../models/QuestProgress');

// 퀘스트 목록 조회 (새로운 형식)
router.get('/list', async (req, res) => {
  try {
    await dbConnect();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다.',
      });
    }

    // 고정된 퀘스트 목록 반환
    const quests = [
      {
        id: 1,
        title: "COMPLETE_FIRST_STAGE",
        totalTimes: 1
      },
      {
        id: 2,
        title: "SCORE_COLLECTOR",
        totalTimes: 500
      },
      {
        id: 3,
        title: "DAILY_CHALLENGE",
        totalTimes: 1
      },
      {
        id: 4,
        title: "STAGE_MASTER",
        totalTimes: 4
      },
      {
        id: 5,
        title: "HIGH_SCORER",
        totalTimes: 1000
      },
      {
        id: 6,
        title: "en_Score",
        totalTimes: 1
      },
      {
        id: 7,
        title: "SBT_quest",
        totalTimes: 1
      }
    ];

    return res.json({
      success: true,
      error: null,
      payload: quests
    });
  } catch (error) {
    console.error('Get quest list error:', error);
    return res.status(500).json({
      success: false,
      error: '퀘스트 목록 조회 중 오류가 발생했습니다.',
    });
  }
});

// 퀘스트 시작
router.post('/start', async (req, res) => {
  try {
    await dbConnect();
    const { userId, questId } = req.body;

    if (!userId || !questId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID와 퀘스트 ID가 필요합니다.',
      });
    }

    let questProgress = await QuestProgressModel.findOne({ userId, questId });
    
    if (!questProgress) {
      questProgress = await QuestProgressModel.create({
        userId,
        questId,
        isCompleted: false,
        progress: 0,
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      questProgress.startedAt = new Date();
      questProgress.updatedAt = new Date();
      await questProgress.save();
    }

    return res.json({
      success: true,
      data: questProgress,
      message: '퀘스트가 시작되었습니다.',
    });
  } catch (error) {
    console.error('Start quest error:', error);
    return res.status(500).json({
      success: false,
      error: '퀘스트 시작 중 오류가 발생했습니다.',
    });
  }
});

// 퀘스트 연결
router.post('/connect', async (req, res) => {
  try {
    await dbConnect();
    const { userId, questId, connectionData } = req.body;

    if (!userId || !questId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID와 퀘스트 ID가 필요합니다.',
      });
    }

    let questProgress = await QuestProgressModel.findOne({ userId, questId });
    
    if (!questProgress) {
      questProgress = await QuestProgressModel.create({
        userId,
        questId,
        isCompleted: false,
        progress: 0,
        isConnected: true,
        connectedAt: new Date(),
        connectionData: connectionData || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      questProgress.isConnected = true;
      questProgress.connectedAt = new Date();
      questProgress.connectionData = connectionData || questProgress.connectionData || {};
      questProgress.updatedAt = new Date();
      await questProgress.save();
    }

    return res.json({
      success: true,
      data: questProgress,
      message: '퀘스트가 연결되었습니다.',
    });
  } catch (error) {
    console.error('Connect quest error:', error);
    return res.status(500).json({
      success: false,
      error: '퀘스트 연결 중 오류가 발생했습니다.',
    });
  }
});

// 퀘스트 연결 해제
router.post('/disconnect', async (req, res) => {
  try {
    await dbConnect();
    const { userId, questId } = req.body;

    if (!userId || !questId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID와 퀘스트 ID가 필요합니다.',
      });
    }

    let questProgress = await QuestProgressModel.findOne({ userId, questId });
    
    if (!questProgress) {
      return res.status(404).json({
        success: false,
        error: '퀘스트 진행도가 없습니다.',
      });
    }

    questProgress.isConnected = false;
    questProgress.disconnectedAt = new Date();
    questProgress.updatedAt = new Date();
    await questProgress.save();

    return res.json({
      success: true,
      data: questProgress,
      message: '퀘스트 연결이 해제되었습니다.',
    });
  } catch (error) {
    console.error('Disconnect quest error:', error);
    return res.status(500).json({
      success: false,
      error: '퀘스트 연결 해제 중 오류가 발생했습니다.',
    });
  }
});

// 퀘스트 업데이트
router.post('/update', async (req, res) => {
  try {
    await dbConnect();
    const { userId, questId, progress } = req.body;

    if (!userId || !questId || progress === undefined) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID, 퀘스트 ID, 진행도가 필요합니다.',
      });
    }

    let questProgress = await QuestProgressModel.findOne({ userId, questId });
    
    if (!questProgress) {
      questProgress = await QuestProgressModel.create({
        userId,
        questId,
        isCompleted: progress >= 100,
        progress: progress,
        completedAt: progress >= 100 ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      questProgress.progress = progress;
      questProgress.isCompleted = progress >= 100;
      questProgress.completedAt = progress >= 100 ? new Date() : questProgress.completedAt;
      questProgress.updatedAt = new Date();
      await questProgress.save();
    }

    return res.json({
      success: true,
      data: questProgress,
      message: '퀘스트 진행도가 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('Update quest error:', error);
    return res.status(500).json({
      success: false,
      error: '퀘스트 업데이트 중 오류가 발생했습니다.',
    });
  }
});

// 퀘스트 체크
router.get('/check', async (req, res) => {
  try {
    await dbConnect();
    const { userId, questId } = req.query;

    if (!userId || !questId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID와 퀘스트 ID가 필요합니다.',
      });
    }

    const questProgress = await QuestProgressModel.findOne({ userId, questId });
    
    if (!questProgress) {
      return res.json({
        success: true,
        data: {
          questId: parseInt(questId),
          isCompleted: false,
          progress: 0,
        },
      });
    }

    return res.json({
      success: true,
      data: questProgress,
    });
  } catch (error) {
    console.error('Check quest error:', error);
    return res.status(500).json({
      success: false,
      error: '퀘스트 확인 중 오류가 발생했습니다.',
    });
  }
});

// 출석 체크
router.post('/attendance', async (req, res) => {
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
    const AttendanceModel = require('../models/Attendance');
    let attendance = await AttendanceModel.findOne({
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
    attendance = await AttendanceModel.create({
      userId,
      date: new Date(),
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      data: attendance,
      message: '출석이 완료되었습니다!',
    });
  } catch (error) {
    console.error('Attendance error:', error);
    return res.status(500).json({
      success: false,
      error: '출석 처리 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router; 