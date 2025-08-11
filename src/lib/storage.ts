import { GameState, Stage, Quest, User } from '@/types/game';

const STORAGE_KEYS = {
  GAME_STATE: 'quest-mock-game-state',
  STAGES: 'quest-mock-game-stages',
  QUESTS: 'quest-mock-game-quests',
  USER: 'quest-mock-game-user',
} as const;

export interface StoredGameData {
  gameState: Partial<GameState>;
  stages: Stage[];
  quests: Quest[];
  user: User | null;
}

// 게임 데이터 저장
export const saveGameData = (data: Partial<StoredGameData>) => {
  try {
    if (data.gameState) {
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(data.gameState));
    }
    if (data.stages) {
      localStorage.setItem(STORAGE_KEYS.STAGES, JSON.stringify(data.stages));
    }
    if (data.quests) {
      localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(data.quests));
    }
    if (data.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    }
  } catch (error) {
    console.error('게임 데이터 저장 중 오류:', error);
  }
};

// 게임 데이터 로드
export const loadGameData = (): Partial<StoredGameData> => {
  try {
    const gameState = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    const stages = localStorage.getItem(STORAGE_KEYS.STAGES);
    const quests = localStorage.getItem(STORAGE_KEYS.QUESTS);
    const user = localStorage.getItem(STORAGE_KEYS.USER);

    return {
      gameState: gameState ? JSON.parse(gameState) : undefined,
      stages: stages ? JSON.parse(stages) : undefined,
      quests: quests ? JSON.parse(quests) : undefined,
      user: user ? JSON.parse(user) : undefined,
    };
  } catch (error) {
    console.error('게임 데이터 로드 중 오류:', error);
    return {};
  }
};

// 특정 사용자의 게임 데이터 저장
export const saveUserGameData = (userId: string, data: Partial<StoredGameData>) => {
  try {
    const userKey = `${STORAGE_KEYS.GAME_STATE}-${userId}`;
    const stagesKey = `${STORAGE_KEYS.STAGES}-${userId}`;
    const questsKey = `${STORAGE_KEYS.QUESTS}-${userId}`;

    if (data.gameState) {
      localStorage.setItem(userKey, JSON.stringify(data.gameState));
    }
    if (data.stages) {
      localStorage.setItem(stagesKey, JSON.stringify(data.stages));
    }
    if (data.quests) {
      localStorage.setItem(questsKey, JSON.stringify(data.quests));
    }
  } catch (error) {
    console.error('사용자 게임 데이터 저장 중 오류:', error);
  }
};

// 특정 사용자의 게임 데이터 로드
export const loadUserGameData = (userId: string): Partial<StoredGameData> => {
  try {
    const userKey = `${STORAGE_KEYS.GAME_STATE}-${userId}`;
    const stagesKey = `${STORAGE_KEYS.STAGES}-${userId}`;
    const questsKey = `${STORAGE_KEYS.QUESTS}-${userId}`;

    const gameState = localStorage.getItem(userKey);
    const stages = localStorage.getItem(stagesKey);
    const quests = localStorage.getItem(questsKey);

    return {
      gameState: gameState ? JSON.parse(gameState) : undefined,
      stages: stages ? JSON.parse(stages) : undefined,
      quests: quests ? JSON.parse(quests) : undefined,
    };
  } catch (error) {
    console.error('사용자 게임 데이터 로드 중 오류:', error);
    return {};
  }
};

// 게임 데이터 삭제
export const clearGameData = (userId?: string) => {
  try {
    if (userId) {
      // 특정 사용자의 데이터만 삭제
      const userKey = `${STORAGE_KEYS.GAME_STATE}-${userId}`;
      const stagesKey = `${STORAGE_KEYS.STAGES}-${userId}`;
      const questsKey = `${STORAGE_KEYS.QUESTS}-${userId}`;
      
      localStorage.removeItem(userKey);
      localStorage.removeItem(stagesKey);
      localStorage.removeItem(questsKey);
    } else {
      // 모든 게임 데이터 삭제
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  } catch (error) {
    console.error('게임 데이터 삭제 중 오류:', error);
  }
}; 