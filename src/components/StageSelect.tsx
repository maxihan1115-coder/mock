'use client';

import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Unlock, Trophy, Star } from 'lucide-react';

export function StageSelect() {
  const { stages, currentStage, setCurrentStage } = useGameStore();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Star className="w-4 h-4 text-green-600" />;
      case 'medium':
        return <Star className="w-4 h-4 text-yellow-600" />;
      case 'hard':
        return <Trophy className="w-4 h-4 text-red-600" />;
      default:
        return <Star className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>스테이지 선택</CardTitle>
        <CardDescription>
          플레이할 스테이지를 선택하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage) => (
            <Card
              key={stage.id}
              className={`cursor-pointer transition-all ${
                currentStage === stage.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:shadow-md'
              } ${!stage.isUnlocked ? 'opacity-50' : ''}`}
              onClick={() => stage.isUnlocked && setCurrentStage(stage.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    스테이지 {stage.id}
                  </CardTitle>
                  {stage.isUnlocked ? (
                    <Unlock className="w-4 h-4 text-green-600" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <CardDescription className="text-sm">
                  {stage.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {stage.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {getDifficultyIcon(stage.difficulty)}
                      <span className={`text-xs font-medium ${getDifficultyColor(stage.difficulty)}`}>
                        {stage.difficulty === 'easy' && '쉬움'}
                        {stage.difficulty === 'medium' && '보통'}
                        {stage.difficulty === 'hard' && '어려움'}
                      </span>
                    </div>
                    {stage.isCompleted && (
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                                     {!stage.isUnlocked && (
                     <div className="space-y-1">
                       <p className="text-xs text-gray-500">
                         필요 점수: {stage.requiredScore}
                       </p>
                       <p className="text-xs text-red-500 font-medium">
                         🔒 잠겨있음
                       </p>
                     </div>
                   )}
                   {stage.isUnlocked && !stage.isCompleted && (
                     <p className="text-xs text-green-500 font-medium">
                       ✅ 해금됨
                     </p>
                   )}
                   {stage.isCompleted && (
                     <p className="text-xs text-yellow-500 font-medium">
                       🏆 완료됨
                     </p>
                   )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 