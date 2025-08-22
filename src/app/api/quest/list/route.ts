import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/mysql';

export async function GET(request: NextRequest) {
  console.log('🔄 /quest/list API 호출됨');
  
  try {
    // 1. API 인증 검증
    const apiAuth = request.headers.get('api-auth');
    const expectedApiKey = 'QULk7WOS/UDyvd7cxEeK4Nav+sK3mxIiM1FGB1r+DGg=';
    
    console.log('🔐 API 인증 검증:', {
      received: apiAuth ? '설정됨' : '설정안됨',
      expected: expectedApiKey ? '설정됨' : '설정안됨',
      receivedValue: apiAuth,
      expectedValue: expectedApiKey,
      isMatch: apiAuth === expectedApiKey
    });
    
    if (!apiAuth || apiAuth !== expectedApiKey) {
      console.log('❌ API 인증 실패');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('✅ API 인증 성공');
    
    // 2. 게임 내 퀘스트 데이터 (인게임 퀘스트와 연동)
    const gameQuests = [
      {
        id: 1,
        title: "COMPLETE_FIRST_STAGE",
        totalTimes: 1,
        description: "첫 번째 스테이지를 완료하세요.",
        type: "achievement"
      },
      {
        id: 2,
        title: "SCORE_COLLECTOR",
        totalTimes: 500,
        description: "총 500점을 획득하세요.",
        type: "achievement"
      },
      {
        id: 3,
        title: "DAILY_CHALLENGE",
        totalTimes: 1,
        description: "오늘 한 번 게임을 플레이하세요.",
        type: "daily"
      },
      {
        id: 4,
        title: "STAGE_MASTER",
        totalTimes: 4,
        description: "모든 스테이지를 완료하세요.",
        type: "achievement"
      },
      {
        id: 5,
        title: "HIGH_SCORER",
        totalTimes: 1000,
        description: "총 1000점을 획득하세요.",
        type: "achievement"
      }
    ];
    
    console.log('📋 게임 내 퀘스트 리스트 생성:', gameQuests);
    
    // 3. 성공 응답 반환 (플랫폼 API 형식에 맞춤)
    const response = {
      success: true,
      error: null,
      payload: gameQuests.map(quest => ({
        id: quest.id,
        title: quest.title,
        totalTimes: quest.totalTimes
      }))
    };
    
    console.log('✅ 퀘스트 리스트 조회 성공:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 /quest/list API 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 