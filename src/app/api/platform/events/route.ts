import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@/types/game';

// 플랫폼 이벤트 생성
export async function POST(request: NextRequest) {
  try {
    const { userId, eventType, eventData } = await request.json();

    if (!userId || !eventType) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자 ID와 이벤트 타입이 필요합니다.',
      }, { status: 400 });
    }

    // 플랫폼으로 이벤트 전송 시뮬레이션
    const platformEvent = {
      userId,
      eventType,
      eventData,
      timestamp: new Date(),
      isSentToPlatform: true,
      sentToPlatformAt: new Date(),
      status: 'sent',
      platformResponse: { success: true, message: 'Event sent to platform' }
    };

    console.log('Platform Event:', platformEvent);

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        eventId: 'simulated-event-id',
        status: platformEvent.status,
        sentAt: platformEvent.sentToPlatformAt,
      },
      message: '플랫폼 이벤트가 성공적으로 전송되었습니다.',
    });

  } catch (error) {
    console.error('Platform event creation error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '플랫폼 이벤트 생성 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
      endpoint: '/api/platform/events'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}

// 플랫폼 이벤트 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventType = searchParams.get('eventType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 시뮬레이션: 빈 배열 반환
    const events: any[] = [];

    return NextResponse.json<APIResponse>({
      success: true,
      data: events,
    });

  } catch (error) {
    console.error('Platform events get error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '플랫폼 이벤트 조회 중 오류가 발생했습니다.',
      timestamp: new Date().toISOString(),
      endpoint: '/api/platform/events'
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
} 