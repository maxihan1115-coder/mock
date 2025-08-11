'use client';

import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Calendar, Award } from 'lucide-react';
import { toast } from 'sonner';

export function QuestPanel() {
  const { quests, score, updateQuestProgress, completeQuest } = useGameStore();

  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'weekly':
        return <Target className="w-4 h-4 text-purple-600" />;
      case 'achievement':
        return <Award className="w-4 h-4 text-yellow-600" />;
      default:
        return <Trophy className="w-4 h-4 text-gray-600" />;
    }
  };

  const getQuestTypeText = (type: string) => {
    switch (type) {
      case 'daily':
        return '일일';
      case 'weekly':
        return '주간';
      case 'achievement':
        return '업적';
      default:
        return '기타';
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    try {
      const response = await fetch('/api/game/quest/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'mock-user-id', // 실제로는 로그인한 사용자의 UUID
          questId,
          progress: 100,
        }),
      });

      const result = await response.json();

      if (result.success) {
        completeQuest(questId);
        toast.success('퀘스트 완료!');
      } else {
        toast.error('퀘스트 완료 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Quest complete error:', error);
      toast.error('퀘스트 완료 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>퀘스트</CardTitle>
        <CardDescription>
          완료할 수 있는 퀘스트들을 확인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quests.map((quest) => (
            <Card key={quest.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getQuestIcon(quest.type)}
                      <span className="text-sm font-medium text-gray-600">
                        {getQuestTypeText(quest.type)}
                      </span>
                      {quest.isCompleted && (
                        <Trophy className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{quest.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{quest.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>진행도</span>
                        <span>{quest.progress} / {quest.maxProgress}</span>
                      </div>
                      <Progress value={(quest.progress / quest.maxProgress) * 100} />
                    </div>

                    <div className="mt-3 text-sm text-gray-500">
                      <p>보상: 경험치 {quest.rewards.experience}, 코인 {quest.rewards.coins}</p>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {quest.isCompleted ? (
                      <Button disabled variant="outline" size="sm">
                        완료됨
                      </Button>
                    ) : quest.progress >= quest.maxProgress ? (
                      <Button 
                        onClick={() => handleCompleteQuest(quest.id)}
                        size="sm"
                      >
                        완료하기
                      </Button>
                    ) : (
                      <Button disabled variant="outline" size="sm">
                        진행 중
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 