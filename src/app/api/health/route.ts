import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 시스템 정보 수집
    const systemInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL ? '설정됨' : '설정안됨',
        PLATFORM_API_BASE_URL: process.env.PLATFORM_API_BASE_URL ? '설정됨' : '설정안됨'
      }
    };

    return NextResponse.json({
      status: 'healthy',
      message: '서버가 정상적으로 실행 중입니다',
      data: systemInfo
    });
  } catch (error) {
    console.error('헬스 체크 오류:', error);
    return NextResponse.json({
      status: 'unhealthy',
      message: '서버 상태 확인 중 오류가 발생했습니다',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
