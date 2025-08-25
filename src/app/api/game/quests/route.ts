import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, Quest } from '@/types/game';

// 퀘스트 진행도 조회
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

    const questProgress = await QuestProgressModel.find({ userId });
    
    // 기본 퀘스트 정보
    const initialQuests: Quest[] = [
      {
        id: 'quest-1',
        title: '첫 번째 모험',
        description: '첫 번째 스테이지를 완료하세요.',
        type: 'achievement',
        requirements: { stageId: 1 },
        rewards: { experience: 100, coins: 50 },
        isCompleted: false,
        progress: 0,
        maxProgress: 1,
      },
      {
        id: 'quest-2',
        title: '점수 수집가',
        description: '총 500점을 획득하세요.',
        type: 'achievement',
        requirements: { score: 500 },
        rewards: { experience: 200, coins: 100 },
        isCompleted: false,
        progress: 0,
        maxProgress: 500,
      },
      {
        id: 'quest-3',
        title: '일일 도전',
        description: '오늘 한 번 게임을 플레이하세요.',
        type: 'daily',
        requirements: {},
        rewards: { experience: 50, coins: 25 },
        isCompleted: false,
        progress: 0,
        maxProgress: 1,
      },
    ];

    // DB에서 가져온 진행도로 퀘스트 정보 업데이트
    const quests = initialQuests.map(quest => {
      const progress = questProgress.find(p => p.questId === quest.id);
      if (progress) {
        return {
          ...quest,
          progress: progress.progress,
          isCompleted: progress.isCompleted,
        };
      }
      return quest;
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: quests,
    });

  } catch (error) {
    console.error('Quests get error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '퀘스트 진행도 조회 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
}

// 퀘스트 진행도 업데이트
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, questId, progress, isCompleted } = await request.json();

    if (!userId || !questId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: '사용자 ID와 퀘스트 ID가 필요합니다.',
      }, { status: 400 });
    }

    const updateData: Partial<{ progress?: number; isCompleted?: boolean; completedAt?: Date; updatedAt: Date }> = { updatedAt: new Date() };
    if (progress !== undefined) updateData.progress = progress;
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      if (isCompleted) {
        updateData.completedAt = new Date();
      }
    }

    const questProgress = await QuestProgressModel.findOneAndUpdate(
      { userId, questId },
      updateData,
      { 
        new: true, 
        upsert: true 
      }
    );

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        questId,
        progress: questProgress.progress,
        isCompleted: questProgress.isCompleted,
      },
    });

  } catch (error) {
    console.error('Quest progress update error:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: '퀘스트 진행도 업데이트 중 오류가 발생했습니다.',
    }, { status: 500 });
  }
} 