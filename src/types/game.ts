export interface User {
  id: string;
  username: string;
  uuid: string;
  createdAt: Date;
  lastLoginAt: Date;
  // 플랫폼 연동 관련 필드들
  platformId?: number;
  memberId?: number;
  bappId?: number;
  platformUuid?: string;
  joinedAt?: Date;
  isPlatformLinked?: boolean;
  platformLinkedAt?: Date;
}

export interface GameState {
  user: User | null;
  currentStage: number;
  score: number;
  lives: number;
  isPlaying: boolean;
  isPaused: boolean;
}

export interface Stage {
  id: number;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requiredScore: number;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement';
  requirements: {
    stageId?: number;
    score?: number;
    playTime?: number;
    allStages?: boolean;
  };
  rewards: {
    experience: number;
    coins: number;
  };
  isCompleted: boolean;
  progress: number;
  maxProgress: number;
}

export interface PlatformEvent {
  type: 'login' | 'logout' | 'quest_complete' | 'stage_complete' | 'score_update';
  userId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  endpoint?: string;
} 