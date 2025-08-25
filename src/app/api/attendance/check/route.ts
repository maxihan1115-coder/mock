import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  console.log('🔄 /attendance/check API 호출됨');
  
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
    
    // 4. 오늘 날짜
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('📅 오늘 날짜:', today);
    
    // 5. 시뮬레이션: 출석 체크
    const consecutiveDays = 1;
    const totalDays = 1;
    const rewards = calculateAttendanceRewards(consecutiveDays);
    
    // 시뮬레이션: 출석 데이터
    const attendance = {
      attendanceDate: today,
      consecutiveDays: consecutiveDays,
      totalDays: totalDays,
      rewards: rewards,
      attendedAt: new Date()
    };
    
    console.log('✅ 출석 체크 성공:', attendance);
    
    // 6. 성공 응답 반환
    const response = {
      success: true,
      error: null,
      payload: {
        attendanceDate: today,
        consecutiveDays: consecutiveDays,
        totalDays: totalDays,
        rewards: rewards,
        attendedAt: attendance.attendedAt
      }
    };
    
    console.log('✅ 출석 체크 응답:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 /attendance/check API 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 출석 보상 계산 함수
function calculateAttendanceRewards(consecutiveDays: number) {
  const baseReward = { experience: 50, coins: 100, items: [] };
  
  // 연속 출석 보너스
  if (consecutiveDays >= 7) {
    return { experience: 200, coins: 500, items: [{ itemId: 'special_item', quantity: 1 }] };
  } else if (consecutiveDays >= 3) {
    return { experience: 100, coins: 250, items: [] };
  }
  
  return baseReward;
}