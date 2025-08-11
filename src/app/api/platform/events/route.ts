import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@/types/game';
import dbConnect from '@/lib/mongodb';
import PlatformEventModel from '@/models/PlatformEvent';

// 플랫폼 이벤트 생성
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, eventType, eventData } = await request.json();

    if (!userId || !eventType) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자 ID와 이벤트 타입이 필요합니다.',
      }, { status: 400 });
    }

    const platformEvent = await PlatformEventModel.create({
      userId,
      eventType,
      eventData,
      timestamp: new Date(),
    });

    // 플랫폼으로 이벤트 전송 시뮬레이션
    console.log('Platform Event:', {
      userId,
      eventType,
      eventData,
      timestamp: platformEvent.timestamp,
    });

    // 실제 플랫폼 연동에서는 여기서 외부 API 호출
    // const platformResponse = await sendToPlatform(platformEvent);
    
    // 시뮬레이션: 성공으로 처리
    platformEvent.isSentToPlatform = true;
    platformEvent.sentToPlatformAt = new Date();
    platformEvent.status = 'sent';
    platformEvent.platformResponse = { success: true, message: 'Event sent to platform' };
    await platformEvent.save();

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        eventId: platformEvent._id,
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
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventType = searchParams.get('eventType');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const query: Record<string, unknown> = {};
    if (userId) query.userId = userId;
    if (eventType) query.eventType = eventType;
    if (status) query.status = status;

    const events = await PlatformEventModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit);

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