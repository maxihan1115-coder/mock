import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, PlatformEvent } from '@/types/game';

export async function POST(request: NextRequest) {
  try {
    const { userId, questId, progress } = await request.json();

    if (!userId || !questId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자 ID와 퀘스트 ID가 필요합니다.',
      }, { status: 400 });
    }

    // 플랫폼 이벤트 발생
    try {
      await fetch(`${request.nextUrl.origin}/api/platform/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          eventType: 'quest_complete',
          eventData: {
            questId,
            progress,
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
        questId,
        progress,
        rewards: {
          experience: 100,
          coins: 50,
        },
      },
      message: '퀘스트 완료',
    });

  } catch (error) {
    console.error('Quest complete error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '퀘스트 완료 처리 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 