import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔄 /quest/start API 호출됨');
  
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
    
    const { uuid } = body;
    
    // 3. UUID 검증
    if (!uuid || typeof uuid !== 'string') {
      console.log('❌ UUID 검증 실패:', { uuid, type: typeof uuid });
      return NextResponse.json(
        { success: false, error: 'Invalid UUID provided' },
        { status: 400 }
      );
    }
    
    console.log('✅ UUID 검증 통과:', uuid);
    
    // 4. 참여 시작 시각 생성
    const startDate = Date.now();
    console.log('📅 참여 시작 시각 생성:', startDate);
    
    // 5. 여기서 DB에 저장하는 로직을 추가할 수 있습니다
    // 예: await QuestModel.create({ uuid, startDate, createdAt: new Date() });
    
    // 6. 성공 응답 반환
    const response = {
      success: true,
      error: null,
      payload: {
        result: true,
        startDate: startDate
      }
    };
    
    console.log('✅ 퀘스트 참여 시작 성공:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 /quest/start API 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 