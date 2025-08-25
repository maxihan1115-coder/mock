import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, Stage } from '@/types/game';

// 스테이지 진행도 조회
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

    
    // 기본 스테이지 정보 (스토어에서 가져온 초기 데이터)
    const initialStages: Stage[] = [
      {
        id: 1,
        name: "숲의 시작",
        description: "첫 번째 스테이지입니다. 기본적인 조작을 익혀보세요.",
        difficulty: 'easy',
        requiredScore: 0,
        isUnlocked: true,
        isCompleted: false,
      },
      {
        id: 2,
        name: "동굴 탐험",
        description: "어두운 동굴을 통과하세요.",
        difficulty: 'easy',
        requiredScore: 100,
        isUnlocked: false,
        isCompleted: false,
      },
      {
        id: 3,
        name: "산의 정상",
        description: "높은 산을 올라 정상에 도달하세요.",
        difficulty: 'medium',
        requiredScore: 300,
        isUnlocked: false,
        isCompleted: false,
      },
      {
        id: 4,
        name: "용의 둥지",
        description: "최종 보스와의 대결입니다.",
        difficulty: 'hard',
        requiredScore: 500,
        isUnlocked: false,
        isCompleted: false,
      },
    ];

    // DB에서 가져온 진행도로 스테이지 정보 업데이트
    const stages = initialStages.map(stage => {
      const progress = stageProgress.find(p => p.stageId === stage.id);
      if (progress) {
        return {
          ...stage,
          isUnlocked: progress.isUnlocked,
          isCompleted: progress.isCompleted,
        };
      }
      return stage;
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: stages,
    });

  } catch (error) {
    console.error('Stages get error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '스테이지 진행도 조회 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 스테이지 진행도 업데이트
export async function PUT(request: NextRequest) {
  try {
    const { userId, stageId, isUnlocked, isCompleted } = await request.json();

    if (!userId || !stageId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자 ID와 스테이지 ID가 필요합니다.',
      }, { status: 400 });
    }

    const updateData: Partial<{ isUnlocked?: boolean; isCompleted?: boolean; completedAt?: Date; updatedAt: Date }> = { updatedAt: new Date() };
    if (isUnlocked !== undefined) updateData.isUnlocked = isUnlocked;
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      if (isCompleted) {
        updateData.completedAt = new Date();
      }
    }

    // 시뮬레이션: 스테이지 진행도 업데이트
    const stageProgress = {
      stageId,
      isUnlocked: isUnlocked || false,
      isCompleted: isCompleted || false,
    };

    return NextResponse.json<APIResponse>({
      success: true,
      data: stageProgress,
    });

  } catch (error) {
    console.error('Stage progress update error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '스테이지 진행도 업데이트 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 