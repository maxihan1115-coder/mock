import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  console.log('🔄 /quest/update API 호출됨');
  
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
    
    const { uuid, questId, progress, isCompleted } = body;
    
    // 3. UUID 검증
    if (!uuid || typeof uuid !== 'string') {
      console.log('❌ UUID 검증 실패:', { uuid, type: typeof uuid });
      return NextResponse.json(
        { success: false, error: 'Invalid UUID provided' },
        { status: 400 }
      );
    }
    
    // 4. questId 검증
    if (!questId || typeof questId !== 'string') {
      console.log('❌ questId 검증 실패:', { questId, type: typeof questId });
      return NextResponse.json(
        { success: false, error: 'Invalid questId provided' },
        { status: 400 }
      );
    }
    
    console.log('✅ 요청 검증 통과:', { uuid, questId, progress, isCompleted });
    
    // 5. 퀘스트 진행도 업데이트 또는 생성
    const questProgressId = `quest-${questId}`;
    
    if (process.env.NODE_ENV === 'production') {
      const existingProgress = await prisma.questProgress.findFirst({
        where: {
          userId: uuid,
          questId: questProgressId
        }
      });
      
      if (existingProgress) {
        // 기존 진행도 업데이트
        await prisma.questProgress.update({
          where: { id: existingProgress.id },
          data: {
            progress: progress || existingProgress.progress,
            isCompleted: isCompleted !== undefined ? isCompleted : existingProgress.isCompleted,
            updatedAt: new Date()
          }
        });
        console.log('📝 기존 퀘스트 진행도 업데이트:', existingProgress);
      } else {
        // 새로운 진행도 생성
        await prisma.questProgress.create({
          data: {
            userId: uuid,
            questId: questProgressId,
            progress: progress || 0,
            isCompleted: isCompleted || false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log('📝 새로운 퀘스트 진행도 생성 완료');
      }
    }
    
    // 7. 성공 응답 반환
    const response = {
      success: true,
      error: null,
      payload: {
        questId,
        progress: progress || 0,
        isCompleted: isCompleted || false
      }
    };
    
    console.log('✅ 퀘스트 진행도 업데이트 성공:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 /quest/update API 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 