import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, PlatformEvent } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const { userId, score, stageId } = await request.json();

    if (!userId || score === undefined) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자 ID와 점수가 필요합니다.',
      }, { status: 400 });
    }

    // 플랫폼 이벤트 발생
    try {
      await fetch(`${request.nextUrl.origin}/api/platform/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          eventType: 'score_update',
          eventData: {
            score,
            stageId,
            updatedAt: new Date(),
          },
        }),
      });
    } catch (error) {
      console.error('Platform event creation error:', error);
    }

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        score,
        stageId,
      },
      message: '점수 업데이트 완료',
    });

  } catch (error) {
    console.error('Score update error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '점수 업데이트 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 