const express = require('express');
const router = express.Router();
const dbConnect = require('../lib/mongodb');
const PlatformEventModel = require('../models/PlatformEvent');

// 플랫폼 이벤트 생성
router.post('/events', async (req, res) => {
  try {
    await dbConnect();
    const { userId, eventType, eventData } = req.body;

    if (!userId || !eventType) {
      return res.status(400).json({
        success: false,
        error: '사용자 ID와 이벤트 타입이 필요합니다.',
      });
    }

    const platformEvent = await PlatformEventModel.create({
      userId,
      eventType,
      eventData,
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      data: platformEvent,
      message: '플랫폼 이벤트가 생성되었습니다.',
    });
  } catch (error) {
    console.error('Create platform event error:', error);
    return res.status(500).json({
      success: false,
      error: '플랫폼 이벤트 생성 중 오류가 발생했습니다.',
    });
  }
});

// 플랫폼 요청 코드 생성
router.post('/request-code', async (req, res) => {
  try {
    const { uuid } = req.body;

    if (!uuid) {
      return res.status(400).json({
        success: false,
        error: 'UUID가 필요합니다.',
      });
    }

    // Next.js API 라우트로 위임
    // 이 라우트는 Next.js API 라우트가 처리하도록 함
    return res.status(404).json({
      success: false,
      error: 'API route not found',
    });
  } catch (error) {
    console.error('Request code error:', error);
    return res.status(500).json({
      success: false,
      error: '요청 코드 생성 중 오류가 발생했습니다.',
    });
  }
});

// 플랫폼 검증
router.post('/validate', async (req, res) => {
  try {
    const { requestCode, platformData } = req.body;

    if (!requestCode || !platformData) {
      return res.status(400).json({
        success: false,
        error: '요청 코드와 플랫폼 데이터가 필요합니다.',
      });
    }

    // 간단한 검증 로직 (실제로는 더 복잡한 검증 필요)
    const isValid = requestCode.startsWith('REQ_') && platformData.id;

    return res.json({
      success: true,
      data: {
        isValid,
        platformData,
        validatedAt: new Date(),
      },
      message: isValid ? '플랫폼 검증이 완료되었습니다.' : '플랫폼 검증에 실패했습니다.',
    });
  } catch (error) {
    console.error('Platform validation error:', error);
    return res.status(500).json({
      success: false,
      error: '플랫폼 검증 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router; 