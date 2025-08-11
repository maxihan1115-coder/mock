const express = require('express');
const router = express.Router();
const dbConnect = require('../lib/mongodb');
const GameStateModel = require('../models/GameState');
const StageProgressModel = require('../models/StageProgress');
const QuestProgressModel = require('../models/QuestProgress');

// 게임 상태 조회
router.get('/state', async (req, res) => {
  try {
    await dbConnect();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다.',
      });
    }

    let gameState = await GameStateModel.findOne({ userId });
    
    if (!gameState) {
      gameState = await GameStateModel.create({
        userId,
        currentStage: 1,
        score: 0,
        lives: 3,
        isPlaying: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return res.json({
      success: true,
      data: gameState,
    });
  } catch (error) {
    console.error('Get game state error:', error);
    return res.status(500).json({
      success: false,
      error: '게임 상태 조회 중 오류가 발생했습니다.',
    });
  }
});

// 스테이지 목록 조회
router.get('/stages', async (req, res) => {
  try {
    await dbConnect();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다.',
      });
    }

    const stageProgress = await StageProgressModel.find({ userId }).sort({ stageNumber: 1 });
    
    // 기본 스테이지 데이터 생성
    const stages = [];
    for (let i = 1; i <= 10; i++) {
      const existingStage = stageProgress.find(sp => sp.stageNumber === i);
      stages.push({
        stageNumber: i,
        isUnlocked: i === 1 || (existingStage && existingStage.isCompleted),
        isCompleted: existingStage ? existingStage.isCompleted : false,
        bestScore: existingStage ? existingStage.bestScore : 0,
        completedAt: existingStage ? existingStage.completedAt : null,
      });
    }

    return res.json({
      success: true,
      data: stages,
    });
  } catch (error) {
    console.error('Get stages error:', error);
    return res.status(500).json({
      success: false,
      error: '스테이지 목록 조회 중 오류가 발생했습니다.',
    });
  }
});

// 스테이지 완료
router.post('/stage/complete', async (req, res) => {
  try {
    await dbConnect();
    const { userId, stageNumber, score } = req.body;

    if (!userId || !stageNumber || score === undefined) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID, 스테이지 번호, 점수가 필요합니다.',
      });
    }

    // 스테이지 진행도 업데이트
    let stageProgress = await StageProgressModel.findOne({ userId, stageNumber });
    
    if (!stageProgress) {
      stageProgress = await StageProgressModel.create({
        userId,
        stageNumber,
        isCompleted: true,
        bestScore: score,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      stageProgress.isCompleted = true;
      stageProgress.bestScore = Math.max(stageProgress.bestScore, score);
      stageProgress.completedAt = new Date();
      stageProgress.updatedAt = new Date();
      await stageProgress.save();
    }

    // 게임 상태 업데이트
    await GameStateModel.findOneAndUpdate(
      { userId },
      { 
        currentStage: Math.max(stageNumber + 1, 1),
        score: score,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    return res.json({
      success: true,
      data: stageProgress,
      message: '스테이지 완료!',
    });
  } catch (error) {
    console.error('Complete stage error:', error);
    return res.status(500).json({
      success: false,
      error: '스테이지 완료 처리 중 오류가 발생했습니다.',
    });
  }
});

// 퀘스트 목록 조회
router.get('/quests', async (req, res) => {
  try {
    await dbConnect();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID가 필요합니다.',
      });
    }

    const questProgress = await QuestProgressModel.find({ userId }).sort({ questId: 1 });
    
    // 기본 퀘스트 데이터 생성
    const quests = [];
    for (let i = 1; i <= 5; i++) {
      const existingQuest = questProgress.find(qp => qp.questId === i);
      quests.push({
        questId: i,
        title: `퀘스트 ${i}`,
        description: `퀘스트 ${i} 설명`,
        isCompleted: existingQuest ? existingQuest.isCompleted : false,
        completedAt: existingQuest ? existingQuest.completedAt : null,
        progress: existingQuest ? existingQuest.progress : 0,
      });
    }

    return res.json({
      success: true,
      data: quests,
    });
  } catch (error) {
    console.error('Get quests error:', error);
    return res.status(500).json({
      success: false,
      error: '퀘스트 목록 조회 중 오류가 발생했습니다.',
    });
  }
});

// 퀘스트 완료
router.post('/quest/complete', async (req, res) => {
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
        isCompleted: true,
        progress: 100,
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      questProgress.isCompleted = true;
      questProgress.progress = 100;
      questProgress.completedAt = new Date();
      questProgress.updatedAt = new Date();
      await questProgress.save();
    }

    return res.json({
      success: true,
      data: questProgress,
      message: '퀘스트 완료!',
    });
  } catch (error) {
    console.error('Complete quest error:', error);
    return res.status(500).json({
      success: false,
      error: '퀘스트 완료 처리 중 오류가 발생했습니다.',
    });
  }
});

// 점수 업데이트
router.post('/score/update', async (req, res) => {
  try {
    await dbConnect();
    const { userId, score } = req.body;

    if (!userId || score === undefined) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID와 점수가 필요합니다.',
      });
    }

    const gameState = await GameStateModel.findOneAndUpdate(
      { userId },
      { 
        score: score,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      data: gameState,
      message: '점수가 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('Update score error:', error);
    return res.status(500).json({
      success: false,
      error: '점수 업데이트 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router; 