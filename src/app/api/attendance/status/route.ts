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
    
    // 4. DB 연결
    await dbConnect();
    
    // 5. 오늘 날짜
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    console.log('📅 오늘 날짜:', today);
    
    // 6. 오늘 출석 여부 확인
    const todayAttendance = await AttendanceModel.findOne({
      userId: uuid,
      attendanceDate: today
    });
    
    // 7. 최근 출석 기록 조회 (7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    const recentAttendance = await AttendanceModel.find({
      userId: uuid,
      attendanceDate: { $gte: sevenDaysAgoStr, $lte: today }
    }).sort({ attendanceDate: 1 });
    
    // 8. 총 출석 통계
    const totalAttendanceCount = await AttendanceModel.countDocuments({ userId: uuid });
    
    // 9. 연속 출석 일수 계산
    let consecutiveDays = 0;
    if (todayAttendance) {
      consecutiveDays = todayAttendance.consecutiveDays;
    } else if (recentAttendance.length > 0) {
      // 어제까지의 연속 출석 계산
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const yesterdayAttendance = recentAttendance.find(a => a.attendanceDate === yesterdayStr);
      if (yesterdayAttendance) {
        consecutiveDays = yesterdayAttendance.consecutiveDays;
      }
    }
    
    // 10. 7일간 출석 현황 생성
    const weeklyStatus = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const attendance = recentAttendance.find(a => a.attendanceDate === dateStr);
      weeklyStatus.push({
        date: dateStr,
        attended: !!attendance,
        rewards: attendance?.rewards || null
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