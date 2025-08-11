import { NextRequest, NextResponse } from 'next/server';
import { User, APIResponse } from '@/types/game';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('Login API called');
    await dbConnect();
    console.log('Database connected');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { username, password, platformData } = body;

    if (!username) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자명이 필요합니다.',
      }, { status: 400 });
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

    const user: User = {
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
      await fetch(`${request.nextUrl.origin}/api/platform/events`, {
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

    return NextResponse.json<APIResponse<User>>({
      success: true,
      data: user,
      message: '로그인 성공',
    });

  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json<APIResponse>({
      success: false,
      error: '로그인 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 