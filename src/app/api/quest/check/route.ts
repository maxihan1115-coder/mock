import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  console.log('🔄 /quest/check API 호출됨');
  
  try {
    // 1. API 인증 검증
    const apiAuth = request.headers.get('api-auth');
    const expectedApiKey = 'QULk7WOS/UDyvd7cxEeK4Nav+sK3mxIiM1FGB1r+DGg=';
    
    console.log('🔐 API 인증 검증:', {
      received: apiAuth ? '설정됨' : '설정안됨',
      expected: expectedApiKey ? '설정됨' : '설정안됨'
    });
    
    if (!apiAuth || apiAuth !== expectedApiKey) {
      console.log('❌ API 인증 실패');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('✅ API 인증 성공');
    
    // 2. 요청 본문 파싱
    const body = await request.json();
    console.log('📥 받은 요청 본문:', body);
    
    const { uuid, questIds } = body;
    
    // 3. UUID 검증
    if (!uuid || typeof uuid !== 'string') {
      console.log('❌ UUID 검증 실패:', { uuid, type: typeof uuid });
      return NextResponse.json(
        { success: false, error: 'Invalid UUID provided' },
        { status: 400 }
      );
    }
    
    // 4. questIds 검증
    if (!questIds || !Array.isArray(questIds)) {
      console.log('❌ questIds 검증 실패:', { questIds, type: typeof questIds });
      return NextResponse.json(
        { success: false, error: 'Invalid questIds provided' },
        { status: 400 }
      );
    }
    
    console.log('✅ 요청 검증 통과:', { uuid, questIds });
    
    // 5. DB 연결 (빌드 시에는 건너뛰기)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 개발 환경: DB 연결 건너뛰기');
    }
    
    // 6. 게임 내 퀘스트 데이터 (인게임 퀘스트와 연동)
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
    
    // 7. 퀘스트 진행도 조회 (DB에서 실제 데이터 가져오기)
    const questProgressList = process.env.NODE_ENV === 'production' 
      ? await prisma.questProgress.findMany({
          where: {
            userId: uuid,
            questId: { in: questIds.map(id => `quest-${id}`) }
          }
        })
      : [];
    
    console.log('📊 DB에서 조회한 퀘스트 진행도:', questProgressList);
    
    // 8. 응답 데이터 생성
    const responsePayload = questIds.map(questId => {
      // 게임 퀘스트에서 해당 ID 찾기
      const gameQuest = gameQuests.find(q => q.id === questId);
      if (!gameQuest) {
        return {
          id: questId,
          totalTimes: 0,
          currentTimes: 0,
          complete: false
        };
      }
      
      // DB에서 진행도 찾기 (quest- 접두사 제거)
      const progress = questProgressList.find(p => p.questId === `quest-${questId}`);
      const currentTimes = progress ? progress.progress : 0;
      const complete = progress ? progress.isCompleted : false;
      
      return {
        id: questId,
        totalTimes: gameQuest.totalTimes,
        currentTimes: currentTimes,
        complete: complete
      };
    });
    
    console.log('📋 생성된 퀘스트 진행도 응답:', responsePayload);
    
    // 9. 성공 응답 반환
    const response = {
      success: true,
      error: null,
      payload: responsePayload
    };
    
    console.log('✅ 퀘스트 달성 여부 조회 성공:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 /quest/check API 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 