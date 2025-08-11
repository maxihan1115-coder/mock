'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { LoginForm } from '@/components/LoginForm';
import { GameCanvas } from '@/components/GameCanvas';
import { StageSelect } from '@/components/StageSelect';
import { QuestPanel } from '@/components/QuestPanel';
import { PlatformEventsPanel } from '@/components/PlatformEventsPanel';
import PlatformIntegration from '@/components/PlatformIntegration';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { LogOut, User, Gamepad2, Trophy, Target, Activity, Link } from 'lucide-react';

type TabType = 'game' | 'stages' | 'quests' | 'platform' | 'integration';

export default function Home() {
  const { user, setUser, score, lives, resetGame } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('game');

  const handleLogout = () => {
    setUser(null);
    resetGame();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <LoginForm />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4">
        {/* 헤더 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">{user.username}</span>
                </div>
                <div className="text-sm text-gray-600">
                  UUID: {user.uuid}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="font-medium">점수: {score}</span>
                  <span className="ml-4 font-medium">생명: {lives}</span>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          <Button
            variant={activeTab === 'game' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('game')}
            className="flex-1"
          >
            <Gamepad2 className="w-4 h-4 mr-2" />
            게임
          </Button>
          <Button
            variant={activeTab === 'stages' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('stages')}
            className="flex-1"
          >
            <Trophy className="w-4 h-4 mr-2" />
            스테이지
          </Button>
          <Button
            variant={activeTab === 'quests' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('quests')}
            className="flex-1"
          >
            <Target className="w-4 h-4 mr-2" />
            퀘스트
          </Button>
          <Button
            variant={activeTab === 'platform' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('platform')}
            className="flex-1"
          >
            <Activity className="w-4 h-4 mr-2" />
            플랫폼
          </Button>
          <Button
            variant={activeTab === 'integration' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('integration')}
            className="flex-1"
          >
            <Link className="w-4 h-4 mr-2" />
            연동
          </Button>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="space-y-6">
          {activeTab === 'game' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GameCanvas />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>게임 정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>현재 사용자:</strong> {user.username}</p>
                      <p><strong>UUID:</strong> {user.uuid}</p>
                      <p><strong>현재 점수:</strong> {score}</p>
                      <p><strong>남은 생명:</strong> {lives}</p>
                      <p><strong>마지막 로그인:</strong> {new Date(user.lastLoginAt).toLocaleString()}</p>
                      <p><strong>플랫폼 연동:</strong> {user.isPlatformLinked ? '✅ 연동됨' : '❌ 미연동'}</p>
                      {user.isPlatformLinked && (
                        <>
                          <p><strong>Platform ID:</strong> {user.platformId}</p>
                          <p><strong>Member ID:</strong> {user.memberId}</p>
                          <p><strong>Bapp ID:</strong> {user.bappId}</p>
                          <p><strong>Platform UUID:</strong> {user.platformUuid}</p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>API 테스트</CardTitle>
                    <CardDescription>
                      플랫폼 연동을 위한 API 테스트
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button 
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/game/score/update', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                userId: user.uuid,
                                score: score,
                                stageId: 1,
                              }),
                            });
                            const result = await response.json();
                            console.log('Score update result:', result);
                          } catch (error) {
                            console.error('Score update error:', error);
                          }
                        }}
                        size="sm"
                        className="w-full"
                      >
                        점수 업데이트 API 테스트
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'stages' && (
            <StageSelect />
          )}

          {activeTab === 'quests' && (
            <QuestPanel />
          )}

          {activeTab === 'platform' && (
            <PlatformEventsPanel />
          )}

          {activeTab === 'integration' && (
            <PlatformIntegration />
          )}
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}
