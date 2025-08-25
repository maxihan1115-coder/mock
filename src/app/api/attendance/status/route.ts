import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔄 /attendance/status API 호출됨');
  
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
    
    // 5. 시뮬레이션: 출석 현황
    const todayAttendance = null; // 오늘 출석 안함
    const recentAttendance: any[] = []; // 빈 배열
    const totalAttendanceCount = 0;
    const consecutiveDays = 0;
    
    // 6. 7일간 출석 현황 생성 (시뮬레이션)
    const weeklyStatus = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      weeklyStatus.push({
        date: dateStr,
        attended: false,
        rewards: null
      });
    }
    
    console.log('📊 출석 현황 조회 완료');
    
    // 11. 성공 응답 반환
    const response = {
      success: true,
      error: null,
      payload: {
        todayAttended: !!todayAttendance,
        consecutiveDays: consecutiveDays,
        totalDays: totalAttendanceCount,
        weeklyStatus: weeklyStatus,
        canAttendToday: !todayAttendance
      }
    };
    
    console.log('✅ 출석 현황 응답:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 /attendance/status API 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}