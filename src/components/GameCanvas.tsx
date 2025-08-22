'use client';

import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

// 테트리스 블록 타입 정의
type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Tetromino {
  type: TetrominoType;
  shape: number[][];
  color: string;
}

interface Position {
  x: number;
  y: number;
}

// 테트리스 블록 모양 정의
const TETROMINOS: Record<TetrominoType, Tetromino> = {
  I: {
    type: 'I',
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00f5ff',
  },
  O: {
    type: 'O',
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#ffff00',
  },
  T: {
    type: 'T',
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a000f0',
  },
  S: {
    type: 'S',
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#00f000',
  },
  Z: {
    type: 'Z',
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#f00000',
  },
  J: {
    type: 'J',
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#0000f0',
  },
  L: {
    type: 'L',
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f0a000',
  },
};

// 게임 설정
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 25;

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const {
    currentStage,
    score,
    isPlaying,
    isPaused,
    setIsPlaying,
    setIsPaused,
    setScore,
    completeStage,
  } = useGameStore();

  // 테트리스 게임 상태
  const [board, setBoard] = useState<(string | number)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position>({ x: 0, y: 0 });
  const [nextPiece, setNextPiece] = useState<Tetromino | null>(null);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [lastDropTime, setLastDropTime] = useState(0);

  // 새로운 테트로미노 생성
  const createNewPiece = (): Tetromino => {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return TETROMINOS[randomType];
  };

  // 게임 초기화
  const initializeGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setLevel(1);
    setLines(0);
    setLastDropTime(0);
    
    const firstPiece = createNewPiece();
    const nextPiece = createNewPiece();
    
    setCurrentPiece(firstPiece);
    setNextPiece(nextPiece);
    setCurrentPosition({ x: Math.floor(BOARD_WIDTH / 2) - Math.floor(firstPiece.shape[0].length / 2), y: 0 });
  };

  // 충돌 검사
  const checkCollision = (piece: Tetromino, position: Position): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = position.x + x;
          const newY = position.y + y;
          
          if (
            newX < 0 || 
            newX >= BOARD_WIDTH || 
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // 보드에 조각 고정
  const placePiece = () => {
    if (!currentPiece) return;
    
    console.log('🔧 조각 고정 시작:', currentPiece.type, currentPosition);
    
    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardX = currentPosition.x + x;
          const boardY = currentPosition.y + y;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
            console.log(`📍 블록 배치: (${boardX}, ${boardY}) = ${currentPiece.color}`);
          }
        }
      }
    }
    
    console.log('🔧 새로운 보드 상태:', newBoard);
    console.log('🔧 보드 첫 번째 행:', newBoard[0]);
    console.log('🔧 보드 두 번째 행:', newBoard[1]);
    setBoard(newBoard);
    
    // 라인 클리어 체크
    checkLines(newBoard);
    
    // 새로운 조각 생성
    spawnNewPiece();
  };

  // 라인 클리어 체크
  const checkLines = (currentBoard: (string | number)[][]) => {
    let linesCleared = 0;
    const newBoard = currentBoard.filter(row => {
      const isFull = row.every(cell => cell !== 0);
      if (isFull) {
        linesCleared++;
        return false;
      }
      return true;
    });
    
    // 제거된 라인만큼 빈 라인 추가
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    if (linesCleared > 0) {
      setLines((prev: number) => prev + linesCleared);
      setScore(score + linesCleared * 100 * level);
      
      // 레벨 업
      const newLines = lines + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        toast.success(`레벨 ${newLevel} 달성!`);
      }
      
      toast.success(`${linesCleared}줄 클리어! +${linesCleared * 100 * level}점`);
    }
    
    setBoard(newBoard);
  };

  // 새로운 조각 생성
  const spawnNewPiece = () => {
    if (!nextPiece) return;
    
    const newPiece = nextPiece;
    const newNextPiece = createNewPiece();
    
    setCurrentPiece(newPiece);
    setNextPiece(newNextPiece);
    setCurrentPosition({ 
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2), 
      y: 0 
    });
    
    // 게임 오버 체크
    if (checkCollision(newPiece, { 
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2), 
      y: 0 
    })) {
      gameOver();
    }
  };

  // 게임 오버
  const gameOver = () => {
    setIsPlaying(false);
    toast.error('게임 오버!');
    
    // 스테이지 완료 체크 (1000점 이상)
    if (score >= 1000) {
      completeStage(currentStage);
      toast.success('스테이지 완료!');
    }
  };

  // 조각 회전
  const rotatePiece = () => {
    if (!currentPiece) return;
    
    const rotated = {
      ...currentPiece,
      shape: currentPiece.shape[0].map((_, i) => 
        currentPiece.shape.map(row => row[row.length - 1 - i])
      )
    };
    
    setCurrentPosition(prev => {
      if (!checkCollision(rotated, prev)) {
        setCurrentPiece(rotated);
      }
      return prev;
    });
  };

  // 조각 이동
  const movePiece = (dx: number, dy: number) => {
    if (!currentPiece) return false;
    
    let moved = false;
    
    setCurrentPosition(prev => {
      const newPosition = { x: prev.x + dx, y: prev.y + dy };
      
      if (!checkCollision(currentPiece, newPosition)) {
        moved = true;
        return newPosition;
      } else {
        if (dy > 0) {
          // 블록이 바닥에 도달했으므로 고정
          console.log('🛑 충돌 감지! 조각 고정 필요');
          setTimeout(() => placePiece(), 0);
        }
        return prev;
      }
    });
    
    return moved;
  };

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused) return;
      
      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'Space':
          e.preventDefault();
          rotatePiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused]);

  // 게임 루프
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastDropTime > (1000 - (level - 1) * 50)) {
        setCurrentPosition(prev => {
          if (!currentPiece) return prev;
          
          const newPosition = { x: prev.x, y: prev.y + 1 };
          
          if (!checkCollision(currentPiece, newPosition)) {
            return newPosition;
          } else {
            // 블록이 바닥에 도달했으므로 고정
            console.log('🔄 자동 하강에서 충돌 감지! 조각 고정');
            placePiece();
            return prev;
          }
        });
        setLastDropTime(timestamp);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isPaused, lastDropTime, level, currentPiece, board]);

  // 게임 시작
  const handleStartGame = () => {
    initializeGame();
    setIsPlaying(true);
    setIsPaused(false);
  };

  // 게임 일시정지/재개
  const handlePauseGame = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  };

  // 게임 리셋
  const handleResetGame = () => {
    setIsPlaying(false);
    setIsPaused(false);
    initializeGame();
  };

  // 캔버스 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = BOARD_WIDTH * BLOCK_SIZE;
    canvas.height = BOARD_HEIGHT * BLOCK_SIZE;

    // 배경 그리기
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    console.log('🎨 캔버스 렌더링 시작, 보드 상태:', board);
    console.log('🎨 보드 첫 번째 행:', board[0]);

    // 보드 그리기
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x] && board[y][x] !== 0) {
          console.log(`🎨 블록 그리기: (${x}, ${y}) = ${board[y][x]}`);
          ctx.fillStyle = board[y][x] as string;
          ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = '#374151';
          ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }

    // 현재 조각 그리기
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const drawX = (currentPosition.x + x) * BLOCK_SIZE;
            const drawY = (currentPosition.y + y) * BLOCK_SIZE;
            ctx.fillRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
            ctx.strokeStyle = '#374151';
            ctx.strokeRect(drawX, drawY, BLOCK_SIZE, BLOCK_SIZE);
          }
        }
      }
    }
  }, [board, currentPiece, currentPosition]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">테트리스 - 스테이지 {currentStage}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {/* 게임 정보 */}
          <div className="flex justify-between w-full max-w-md">
            <div className="text-center">
              <div className="text-sm text-gray-500">점수</div>
              <div className="text-xl font-bold">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">레벨</div>
              <div className="text-xl font-bold">{level}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">라인</div>
              <div className="text-xl font-bold">{lines}</div>
            </div>
          </div>
          
          {/* 게임 캔버스 */}
          <div className="relative">
          <canvas
            ref={canvasRef}
              className="border-2 border-gray-600 bg-gray-800"
              style={{
                width: BOARD_WIDTH * BLOCK_SIZE,
                height: BOARD_HEIGHT * BLOCK_SIZE,
              }}
            />
            
            {/* 게임 오버 오버레이 */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold mb-2">테트리스</div>
                  <div className="text-sm mb-4">시작하려면 버튼을 클릭하세요</div>
                </div>
              </div>
            )}
            
            {/* 일시정지 오버레이 */}
            {isPaused && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">일시정지</div>
              </div>
            )}
          </div>

          {/* 다음 조각 미리보기 */}
          {nextPiece && (
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-2">다음 조각</div>
              <div 
                className="inline-block border border-gray-600 bg-gray-800"
                style={{
                  width: nextPiece.shape[0].length * 20,
                  height: nextPiece.shape.length * 20,
                }}
              >
                {nextPiece.shape.map((row, y) => 
                  row.map((cell, x) => 
                    cell ? (
                      <div
                        key={`${x}-${y}`}
                        className="inline-block"
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: nextPiece.color,
                          border: '1px solid #374151',
                        }}
                      />
                    ) : (
                      <div
                        key={`${x}-${y}`}
                        className="inline-block"
                        style={{ width: 20, height: 20 }}
                      />
                    )
                  )
                )}
              </div>
            </div>
          )}

          {/* 컨트롤 버튼 */}
          <div className="flex space-x-2">
            <Button
              onClick={handleStartGame}
              disabled={isPlaying}
              className="flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>시작</span>
            </Button>
            
            <Button
              onClick={handlePauseGame}
              disabled={!isPlaying}
              className="flex items-center space-x-2"
            >
              <Pause className="w-4 h-4" />
              <span>{isPaused ? '재개' : '일시정지'}</span>
            </Button>
            
            <Button
              onClick={handleResetGame}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>리셋</span>
            </Button>
          </div>

          {/* 조작법 */}
          <div className="text-center text-sm text-gray-500">
            <div>← → : 이동 | ↑ : 회전 | ↓ : 빠른 하강</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 