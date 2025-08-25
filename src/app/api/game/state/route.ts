import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@/types/game';

// 게임 상태 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자 ID가 필요합니다.',
      }, { status: 400 });
    }

    // 시뮬레이션: 게임 상태
    const gameState = {
      currentStage: 1,
      score: 0,
      lives: 3,
      isPlaying: false,
      isPaused: false,
    };

    return NextResponse.json<APIResponse>({
      success: true,
      data: gameState,
    });

  } catch (error) {
    console.error('Game state get error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '게임 상태 조회 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 게임 상태 업데이트
export async function PUT(request: NextRequest) {
  try {
    const { userId, ...updateData } = await request.json();

    if (!userId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자 ID가 필요합니다.',
      }, { status: 400 });
    }

    // 시뮬레이션: 게임 상태 업데이트
    const updatedGameState = {
      currentStage: 1,
      score: 0,
      lives: 3,
      isPlaying: false,
      isPaused: false,
      ...updateData,
    };

    return NextResponse.json<APIResponse>({
      success: true,
      data: updatedGameState,
    });

  } catch (error) {
    console.error('Game state update error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '게임 상태 업데이트 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 