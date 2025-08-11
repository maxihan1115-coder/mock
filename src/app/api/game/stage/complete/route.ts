import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, PlatformEvent } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const { userId, stageId, score, timeSpent } = await request.json();

    if (!userId || !stageId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자 ID와 스테이지 ID가 필요합니다.',
      }, { status: 400 });
    }

    // 플랫폼 이벤트 발생
    try {
      await fetch(`${request.nextUrl.origin}/api/platform/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          eventType: 'stage_complete',
          eventData: {
            stageId,
            score,
            timeSpent,
            completedAt: new Date(),
          },
        }),
      });
    } catch (error) {
      console.error('Platform event creation error:', error);
    }

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        stageId,
        score,
        rewards: {
          experience: score * 10,
          coins: Math.floor(score / 10),
        },
      },
      message: '스테이지 완료',
    });

  } catch (error) {
    console.error('Stage complete error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '스테이지 완료 처리 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 