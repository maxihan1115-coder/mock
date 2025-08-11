'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface Player extends GameObject {
  velocityX: number;
  velocityY: number;
  onGround: boolean;
}

interface Obstacle extends GameObject {
  type: 'platform' | 'enemy' | 'collectible';
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  
  const {
    user,
    currentStage,
    score,
    lives,
    isPlaying,
    isPaused,
    setIsPlaying,
    setIsPaused,
    setScore,
    setLives,
    completeStage,
    unlockStage,
  } = useGameStore();

  const [player, setPlayer] = useState<Player>({
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    color: '#3b82f6',
    velocityX: 0,
    velocityY: 0,
    onGround: false,
  });

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameTime, setGameTime] = useState(0);

  // 스테이지별 장애물 설정
  useEffect(() => {
    const stageObstacles: Obstacle[] = [];
    
    switch (currentStage) {
      case 1:
        // 기본 플랫폼들
        stageObstacles.push(
          { x: 0, y: 350, width: 800, height: 50, color: '#8b5a2b', type: 'platform' },
          { x: 200, y: 250, width: 100, height: 20, color: '#8b5a2b', type: 'platform' },
          { x: 400, y: 200, width: 100, height: 20, color: '#8b5a2b', type: 'platform' },
          { x: 600, y: 150, width: 100, height: 20, color: '#8b5a2b', type: 'platform' },
          { x: 750, y: 100, width: 50, height: 20, color: '#8b5a2b', type: 'platform' },
          // 수집 아이템
          { x: 220, y: 220, width: 20, height: 20, color: '#fbbf24', type: 'collectible' },
          { x: 420, y: 170, width: 20, height: 20, color: '#fbbf24', type: 'collectible' },
          { x: 620, y: 120, width: 20, height: 20, color: '#fbbf24', type: 'collectible' },
        );
        break;
      case 2:
        // 동굴 스테이지
        stageObstacles.push(
          { x: 0, y: 350, width: 800, height: 50, color: '#4b5563', type: 'platform' },
          { x: 150, y: 280, width: 80, height: 20, color: '#4b5563', type: 'platform' },
          { x: 300, y: 210, width: 80, height: 20, color: '#4b5563', type: 'platform' },
          { x: 450, y: 140, width: 80, height: 20, color: '#4b5563', type: 'platform' },
          { x: 600, y: 70, width: 80, height: 20, color: '#4b5563', type: 'platform' },
          { x: 750, y: 0, width: 50, height: 20, color: '#4b5563', type: 'platform' },
          // 적
          { x: 200, y: 320, width: 25, height: 25, color: '#ef4444', type: 'enemy' },
          { x: 400, y: 180, width: 25, height: 25, color: '#ef4444', type: 'enemy' },
        );
        break;
      case 3:
        // 산 스테이지
        stageObstacles.push(
          { x: 0, y: 350, width: 800, height: 50, color: '#6b7280', type: 'platform' },
          { x: 100, y: 300, width: 60, height: 20, color: '#6b7280', type: 'platform' },
          { x: 200, y: 250, width: 60, height: 20, color: '#6b7280', type: 'platform' },
          { x: 300, y: 200, width: 60, height: 20, color: '#6b7280', type: 'platform' },
          { x: 400, y: 150, width: 60, height: 20, color: '#6b7280', type: 'platform' },
          { x: 500, y: 100, width: 60, height: 20, color: '#6b7280', type: 'platform' },
          { x: 600, y: 50, width: 60, height: 20, color: '#6b7280', type: 'platform' },
          { x: 700, y: 0, width: 100, height: 20, color: '#6b7280', type: 'platform' },
        );
        break;
      case 4:
        // 보스 스테이지
        stageObstacles.push(
          { x: 0, y: 350, width: 800, height: 50, color: '#dc2626', type: 'platform' },
          { x: 350, y: 200, width: 100, height: 100, color: '#dc2626', type: 'enemy' },
        );
        break;
    }
    
    setObstacles(stageObstacles);
    setPlayer({ ...player, x: 50, y: 300 });
  }, [currentStage]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key);
        return newKeys;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 게임 루프
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const gameLoop = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 플레이어 이동
      let newVelocityX = 0;
      if (keys.has('ArrowLeft') || keys.has('a')) newVelocityX = -5;
      if (keys.has('ArrowRight') || keys.has('d')) newVelocityX = 5;
      
      if (keys.has('ArrowUp') || keys.has('w') || keys.has(' ')) {
        if (player.onGround) {
          player.velocityY = -12;
          player.onGround = false;
        }
      }

      // 중력 적용
      player.velocityY += 0.6;
      
      // 플레이어 위치 업데이트
      const newPlayer = {
        ...player,
        x: player.x + newVelocityX,
        y: player.y + player.velocityY,
        velocityX: newVelocityX,
        velocityY: player.velocityY,
        onGround: false,
      };

      // 충돌 감지
      let onGround = false;
      for (const obstacle of obstacles) {
        if (obstacle.type === 'platform') {
          if (newPlayer.x < obstacle.x + obstacle.width &&
              newPlayer.x + newPlayer.width > obstacle.x &&
              newPlayer.y < obstacle.y + obstacle.height &&
              newPlayer.y + newPlayer.height > obstacle.y) {
            
            // 위에서 충돌
            if (player.velocityY > 0 && player.y < obstacle.y) {
              newPlayer.y = obstacle.y - newPlayer.height;
              newPlayer.velocityY = 0;
              newPlayer.onGround = true;
              onGround = true;
            }
          }
        } else if (obstacle.type === 'enemy') {
          if (newPlayer.x < obstacle.x + obstacle.width &&
              newPlayer.x + newPlayer.width > obstacle.x &&
              newPlayer.y < obstacle.y + obstacle.height &&
              newPlayer.y + newPlayer.height > obstacle.y) {
            
            // 적과 충돌
            setLives(lives - 1);
            toast.error('적과 충돌했습니다!');
            
            if (lives <= 1) {
              setIsPlaying(false);
              toast.error('게임 오버!');
              return;
            }
            
            // 플레이어 리셋
            newPlayer.x = 50;
            newPlayer.y = 300;
            newPlayer.velocityY = 0;
          }
        } else if (obstacle.type === 'collectible') {
          if (newPlayer.x < obstacle.x + obstacle.width &&
              newPlayer.x + newPlayer.width > obstacle.x &&
              newPlayer.y < obstacle.y + obstacle.height &&
              newPlayer.y + newPlayer.height > obstacle.y) {
            
            // 아이템 수집
            setScore(score + 50);
            toast.success('아이템 수집! +50점');
            
            // 아이템 제거
            setObstacles(prev => prev.filter(o => o !== obstacle));
          }
        }
      }

      newPlayer.onGround = onGround;

      // 화면 경계 체크
      if (newPlayer.x < 0) newPlayer.x = 0;
      if (newPlayer.x + newPlayer.width > canvas.width) newPlayer.x = canvas.width - newPlayer.width;
      if (newPlayer.y < 0) newPlayer.y = 0;
      if (newPlayer.y + newPlayer.height > canvas.height) {
        newPlayer.y = canvas.height - newPlayer.height;
        newPlayer.velocityY = 0;
        newPlayer.onGround = true;
      }

      setPlayer(newPlayer);

      // 목표 지점 도달 체크
      if (newPlayer.x > 750 && currentStage <= 4) {
        completeStage(currentStage);
        
        // 다음 스테이지 해금
        if (currentStage < 4) {
          unlockStage(currentStage + 1);
        }
        
        setIsPlaying(false);
        toast.success(`스테이지 ${currentStage} 완료! 다음 스테이지가 해금되었습니다.`);
        
        // 스테이지 완료 API 호출
        if (user) {
          fetch('/api/game/stage/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.uuid,
              stageId: currentStage,
              score,
              timeSpent: gameTime,
            }),
          });
          
          // 퀘스트 업데이트
          // 1번 퀘스트: 첫 번째 스테이지 완료
          if (currentStage === 1) {
            fetch('/api/quest/update', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'api-auth': 'QULk7WOS/UDyvd7cxEeK4Nav+sK3mxIiM1FGB1r+DGg='
              },
              body: JSON.stringify({
                uuid: user.uuid,
                questId: '1',
                progress: 1,
                isCompleted: true
              }),
            });
          }
          
          // 4번 퀘스트: 모든 스테이지 완료 (진행도 업데이트)
          fetch('/api/quest/update', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'api-auth': process.env.NEXT_PUBLIC_API_KEY || ''
            },
            body: JSON.stringify({
              uuid: user.uuid,
              questId: '4',
              progress: currentStage,
              isCompleted: currentStage >= 4
            }),
          });
        }
      }

      // 렌더링
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 배경
      ctx.fillStyle = '#87ceeb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 플레이어 그리기
      ctx.fillStyle = newPlayer.color;
      ctx.fillRect(newPlayer.x, newPlayer.y, newPlayer.width, newPlayer.height);
      
      // 장애물 그리기
      obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      });

      // 목표 지점
      ctx.fillStyle = '#10b981';
      ctx.fillRect(750, 0, 50, 50);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isPaused, keys, obstacles, player, score, lives, currentStage, user, gameTime]);

  // 게임 시간 업데이트
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const interval = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused]);

  // 점수 업데이트 시 퀘스트 업데이트
  useEffect(() => {
    if (!user || score === 0) return;

    // 2번 퀘스트: 총 500점 획득
    if (score >= 500) {
      fetch('/api/quest/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'api-auth': 'QULk7WOS/UDyvd7cxEeK4Nav+sK3mxIiM1FGB1r+DGg='
        },
        body: JSON.stringify({
          uuid: user.uuid,
          questId: '2',
          progress: Math.min(score, 500),
          isCompleted: score >= 500
        }),
      });
    }

    // 5번 퀘스트: 총 1000점 획득
    if (score >= 1000) {
      fetch('/api/quest/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'api-auth': 'QULk7WOS/UDyvd7cxEeK4Nav+sK3mxIiM1FGB1r+DGg='
        },
        body: JSON.stringify({
          uuid: user.uuid,
          questId: '5',
          progress: Math.min(score, 1000),
          isCompleted: score >= 1000
        }),
      });
    }
  }, [score, user]);

  const handleStartGame = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setGameTime(0);
    
    // 3번 퀘스트: 오늘 한 번 게임을 플레이
    if (user) {
      fetch('/api/quest/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'api-auth': 'QULk7WOS/UDyvd7cxEeK4Nav+sK3mxIiM1FGB1r+DGg='
        },
        body: JSON.stringify({
          uuid: user.uuid,
          questId: '3',
          progress: 1,
          isCompleted: true
        }),
      });
    }
  };

  const handlePauseGame = () => {
    setIsPaused(!isPaused);
  };

  const handleResetGame = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setGameTime(0);
    setPlayer({ ...player, x: 50, y: 300, velocityX: 0, velocityY: 0 });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>스테이지 {currentStage}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="space-x-4">
              <span>점수: {score}</span>
              <span>생명: {lives}</span>
              <span>시간: {gameTime}초</span>
            </div>
            <div className="space-x-2">
              <Button onClick={handleStartGame} disabled={isPlaying}>
                <Play className="w-4 h-4 mr-2" />
                시작
              </Button>
              <Button onClick={handlePauseGame} disabled={!isPlaying}>
                {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                {isPaused ? '재개' : '일시정지'}
              </Button>
              <Button onClick={handleResetGame}>
                <RotateCcw className="w-4 h-4 mr-2" />
                리셋
              </Button>
            </div>
          </div>
          
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="border border-gray-300 bg-blue-200"
          />
          
          <div className="mt-4 text-sm text-gray-600">
            <p>조작법: 방향키 또는 WASD로 이동, 스페이스바로 점프</p>
            <p>목표: 초록색 목표 지점에 도달하세요!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 