import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { uuid } = await request.json();

    // UUID 검증
    if (!uuid || typeof uuid !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid UUID provided' },
        { status: 400 }
      );
    }

    // 순차적 UUID 형식 검증 (숫자만 허용)
    const uuidRegex = /^\d+$/;
    if (!uuidRegex.test(uuid)) {
      return NextResponse.json(
        { success: false, error: 'Invalid UUID format (must be numeric)' },
        { status: 400 }
      );
    }

    // 숫자 UUID라면 모두 허용 (더 유연한 검증)
    const uuidNumber = parseInt(uuid);
    if (uuidNumber <= 0) {
      return NextResponse.json(
        { success: false, error: 'UUID must be a positive number' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        uuid,
        authorized: true,
      },
    });
  } catch (error) {
    console.error('UUID validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        endpoint: '/api/platform/validate'
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