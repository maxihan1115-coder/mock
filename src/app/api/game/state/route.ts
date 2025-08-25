import { NextRequest, NextResponse } from 'next/server';
import { APIResponse } from '@/types/game';

// 게임 상태 조회
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자 ID가 필요합니다.',
      }, { status: 400 });
    }

    let gameState = await GameStateModel.findOne({ userId });
    
    if (!gameState) {
      // 기본 게임 상태 생성
      gameState = await GameStateModel.create({
        userId,
        currentStage: 1,
        score: 0,
        lives: 3,
        isPlaying: false,
        isPaused: false,
      });
    }

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        currentStage: gameState.currentStage,
        score: gameState.score,
        lives: gameState.lives,
        isPlaying: gameState.isPlaying,
        isPaused: gameState.isPaused,
      },
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
    await dbConnect();
    const { userId, ...updateData } = await request.json();

    if (!userId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자 ID가 필요합니다.',
      }, { status: 400 });
    }

    const gameState = await GameStateModel.findOneAndUpdate(
      { userId },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { 
        new: true, 
        upsert: true 
      }
    );

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        currentStage: gameState.currentStage,
        score: gameState.score,
        lives: gameState.lives,
        isPlaying: gameState.isPlaying,
        isPaused: gameState.isPaused,
      },
    });

  } catch (error) {
    console.error('Game state update error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '게임 상태 업데이트 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 