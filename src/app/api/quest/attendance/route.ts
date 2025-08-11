import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AttendanceModel from '@/models/Attendance';

export async function POST(request: NextRequest) {
  console.log('🔄 /quest/attendance API 호출됨');
  
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
    
    const { uuid, attendanceDate } = body;
    
    // 3. 필수 파라미터 검증
    if (!uuid || typeof uuid !== 'string') {
      console.log('❌ UUID 검증 실패:', { uuid, type: typeof uuid });
      return NextResponse.json(
        { success: false, error: 'Invalid UUID provided' },
        { status: 400 }
      );
    }
    
    if (!attendanceDate || typeof attendanceDate !== 'string') {
      console.log('❌ attendanceDate 검증 실패:', { attendanceDate, type: typeof attendanceDate });
      return NextResponse.json(
        { success: false, error: 'Invalid attendanceDate provided' },
        { status: 400 }
      );
    }
    
    console.log('✅ 파라미터 검증 통과:', { uuid, attendanceDate });
    
    // 4. 날짜 형식 변환 (YYYYMMDD -> YYYY-MM-DD)
    let formattedDate: string;
    try {
      if (attendanceDate.length === 8 && /^\d{8}$/.test(attendanceDate)) {
        // YYYYMMDD 형식
        const year = attendanceDate.substring(0, 4);
        const month = attendanceDate.substring(4, 6);
        const day = attendanceDate.substring(6, 8);
        formattedDate = `${year}-${month}-${day}`;
      } else if (attendanceDate.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(attendanceDate)) {
        // YYYY-MM-DD 형식 (이미 올바른 형식)
        formattedDate = attendanceDate;
      } else {
        throw new Error('Invalid date format');
      }
      
      console.log('📅 날짜 형식 변환:', { 
        original: attendanceDate, 
        formatted: formattedDate 
      });
    } catch (error) {
      console.log('❌ 날짜 형식 오류:', { attendanceDate, error });
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Expected YYYYMMDD or YYYY-MM-DD' },
        { status: 400 }
      );
    }
    
    // 5. DB 연결
    await dbConnect();
    console.log('✅ DB 연결 완료');
    
    // 6. 해당 날짜의 출석 기록 조회
    const attendanceRecord = await AttendanceModel.findOne({
      userId: uuid,
      attendanceDate: formattedDate
    });
    
    console.log('🔍 출석 기록 조회 결과:', {
      userId: uuid,
      attendanceDate: formattedDate,
      found: !!attendanceRecord,
      record: attendanceRecord ? {
        attendedAt: attendanceRecord.attendedAt,
        consecutiveDays: attendanceRecord.consecutiveDays,
        totalDays: attendanceRecord.totalDays
      } : null
    });
    
    // 7. 출석 여부 판정
    const hasAttended = !!attendanceRecord;
    
    // 8. 플랫폼 API 명세에 맞춘 응답 반환
    const response = {
      success: true,
      error: null,
      payload: hasAttended
    };
    
    console.log('✅ 출석 여부 조회 완료:', response);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 /quest/attendance API 오류:', error);
    console.error('💥 오류 스택:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}