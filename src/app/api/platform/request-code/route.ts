import { NextRequest, NextResponse } from 'next/server';
import { requestPlatformCode, createPlatformOutlink } from '@/lib/platform';

export async function POST(request: NextRequest) {
  console.log('🔄 /api/platform/request-code 호출됨');
  
  try {
    const body = await request.json();
    console.log('📥 받은 요청 본문:', body);
    
    const { uuid } = body;
    console.log('📥 받은 UUID:', uuid);

    // UUID 검증
    if (!uuid || typeof uuid !== 'string') {
      console.log('❌ UUID 검증 실패:', { uuid, type: typeof uuid });
      return NextResponse.json(
        { success: false, error: 'Invalid UUID provided' },
        { status: 400 }
      );
    }

    console.log('✅ UUID 검증 통과, 플랫폼 API 호출 시작');

    // 플랫폼 API에 임시 코드 요청
    const platformResponse = await requestPlatformCode(uuid);

    console.log('📡 플랫폼 API 응답 결과:', {
      success: platformResponse.success,
      hasCode: !!platformResponse.code,
      error: platformResponse.error
    });

    if (!platformResponse.success) {
      console.log('❌ 플랫폼 API 요청 실패');
      return NextResponse.json(
        { success: false, error: platformResponse.error || 'Platform API request failed' },
        { status: 500 }
      );
    }

    // 플랫폼에서 받은 코드로 아웃링크 생성
    const temporaryCode = platformResponse.code;
    
    if (!temporaryCode) {
      console.log('❌ 플랫폼에서 코드를 받지 못함');
      return NextResponse.json(
        { success: false, error: 'No code received from platform' },
        { status: 500 }
      );
    }
    
    const outlink = createPlatformOutlink(temporaryCode);

    console.log('✅ 아웃링크 생성 완료:', {
      temporaryCode,
      outlink,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    return NextResponse.json({
      success: true,
      data: {
        temporaryCode,
        outlink,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15분 후 만료
      },
    });
  } catch (error) {
    console.error('💥 /api/platform/request-code 오류:', error);
    console.error('💥 오류 스택:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        endpoint: '/api/platform/request-code'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 