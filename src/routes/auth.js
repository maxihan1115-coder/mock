const express = require('express');
const router = express.Router();
const dbConnect = require('../lib/mongodb');
const UserModel = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    await dbConnect();
    const { username, platformData } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: '사용자명이 필요합니다.',
      });
    }

    // 기존 사용자 확인
    let userDoc = await UserModel.findOne({ username });
    
    if (!userDoc) {
      // 새 사용자 생성 - 순차적 UUID 생성
      const userCount = await UserModel.countDocuments();
      const sequentialUuid = (userCount + 1).toString();
      
      const newUser = {
        username,
        uuid: sequentialUuid,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        // 플랫폼 데이터가 있으면 연동 정보 추가
        ...(platformData && {
          platformId: platformData.id,
          memberId: platformData.memberId,
          bappId: platformData.bappId,
          platformUuid: platformData.uuid,
          joinedAt: platformData.joinedAt ? new Date(platformData.joinedAt) : null,
          isPlatformLinked: true,
          platformLinkedAt: new Date(),
        }),
      };
      userDoc = await UserModel.create(newUser);
    } else {
      // 기존 사용자의 마지막 로그인 시간 업데이트
      userDoc.lastLoginAt = new Date();
      
      // 플랫폼 데이터가 있으면 연동 정보 업데이트
      if (platformData) {
        userDoc.platformId = platformData.id;
        userDoc.memberId = platformData.memberId;
        userDoc.bappId = platformData.bappId;
        userDoc.platformUuid = platformData.uuid;
        userDoc.joinedAt = platformData.joinedAt ? new Date(platformData.joinedAt) : null;
        userDoc.isPlatformLinked = true;
        userDoc.platformLinkedAt = new Date();
      }
      
      await userDoc.save();
    }

    const user = {
      id: userDoc._id.toString(),
      username: userDoc.username,
      uuid: userDoc.uuid,
      createdAt: userDoc.createdAt,
      lastLoginAt: userDoc.lastLoginAt,
      platformId: userDoc.platformId,
      memberId: userDoc.memberId,
      bappId: userDoc.bappId,
      platformUuid: userDoc.platformUuid,
      joinedAt: userDoc.joinedAt,
      isPlatformLinked: userDoc.isPlatformLinked,
      platformLinkedAt: userDoc.platformLinkedAt,
    };

    // 플랫폼 이벤트 발생
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      await fetch(`${baseUrl}/api/platform/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uuid,
          eventType: 'login',
          eventData: {
            username: user.username,
            loginTime: user.lastLoginAt,
            platformId: userDoc.platformId || null,
            memberId: userDoc.memberId || null,
            bappId: userDoc.bappId || null,
            platformUuid: userDoc.platformUuid || null,
            isPlatformLinked: userDoc.isPlatformLinked || false,
          },
        }),
      });
    } catch (error) {
      console.error('Platform event creation error:', error);
    }

    return res.json({
      success: true,
      data: user,
      message: '로그인 성공',
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: '로그인 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router; 