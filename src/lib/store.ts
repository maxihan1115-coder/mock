import { create } from 'zustand';
import { GameState, User, Stage, Quest } from '@/types/game';

interface GameStore extends GameState {
  // Actions
  setUser: (user: User | null) => void;
  setCurrentStage: (stage: number) => void;
  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  resetGame: () => void;
  
  // Stages
  stages: Stage[];
  setStages: (stages: Stage[]) => void;
  unlockStage: (stageId: number) => void;
  completeStage: (stageId: number) => void;
  
  // Quests
  quests: Quest[];
  setQuests: (quests: Quest[]) => void;
  updateQuestProgress: (questId: string, progress: number) => void;
  completeQuest: (questId: string) => void;
}

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

const initialQuests: Quest[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
    title: '일일 도전',
    description: '오늘 한 번 게임을 플레이하세요.',
    type: 'daily',
    requirements: {},
    rewards: { experience: 50, coins: 25 },
    isCompleted: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: '4',
    title: '스테이지 마스터',
    description: '모든 스테이지를 완료하세요.',
    type: 'achievement',
    requirements: { allStages: true },
    rewards: { experience: 300, coins: 150 },
    isCompleted: false,
    progress: 0,
    maxProgress: 4,
  },
  {
    id: '5',
    title: '고득점자',
    description: '총 1000점을 획득하세요.',
    type: 'achievement',
    requirements: { score: 1000 },
    rewards: { experience: 400, coins: 200 },
    isCompleted: false,
    progress: 0,
    maxProgress: 1000,
  },
];

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  user: null,
  currentStage: 1,
  score: 0,
  lives: 3,
  isPlaying: false,
  isPaused: false,
  stages: initialStages,
  quests: initialQuests,

  // Actions
  setUser: (user) => {
    if (user) {
      // 사용자 로그인 시 DB에서 게임 데이터 로드
      set({ user });
      
      // 게임 상태 로드
      fetch(`/api/game/state?userId=${user.uuid}`)
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            set(result.data);
          }
        })
        .catch(console.error);
      
      // 스테이지 진행도 로드
      fetch(`/api/game/stages?userId=${user.uuid}`)
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            set({ stages: result.data });
          }
        })
        .catch(console.error);
      
      // 퀘스트 진행도 로드
      fetch(`/api/game/quests?userId=${user.uuid}`)
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            set({ quests: result.data });
          }
        })
        .catch(console.error);
    } else {
      // 로그아웃 시 게임 상태 리셋
      set({ user: null });
    }
  },
  setCurrentStage: (currentStage) => set((state) => {
    if (state.user) {
      fetch('/api/game/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.uuid,
          currentStage,
        }),
      }).catch(console.error);
    }
    return { currentStage };
  }),
  setScore: (score) => set((state) => {
    // 점수에 따른 스테이지 해금
    const newStages = state.stages.map(stage => {
      if (!stage.isUnlocked && score >= stage.requiredScore) {
        return { ...stage, isUnlocked: true };
      }
      return stage;
    });
    
    const newState = { 
      score,
      stages: newStages
    };
    
    if (state.user) {
      // 점수 업데이트
      fetch('/api/game/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.uuid,
          score,
        }),
      }).catch(console.error);
      
      // 스테이지 해금 상태 업데이트
      newStages.forEach(stage => {
        if (stage.isUnlocked && state.user) {
          fetch('/api/game/stages', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: state.user.uuid,
              stageId: stage.id,
              isUnlocked: true,
            }),
          }).catch(console.error);
        }
      });
    }
    
    return newState;
  }),
  setLives: (lives) => set((state) => {
    if (state.user) {
      fetch('/api/game/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.uuid,
          lives,
        }),
      }).catch(console.error);
    }
    return { lives };
  }),
  setIsPlaying: (isPlaying) => set((state) => {
    if (state.user) {
      fetch('/api/game/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.uuid,
          isPlaying,
        }),
      }).catch(console.error);
    }
    return { isPlaying };
  }),
  setIsPaused: (isPaused) => set((state) => {
    if (state.user) {
      fetch('/api/game/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.uuid,
          isPaused,
        }),
      }).catch(console.error);
    }
    return { isPaused };
  }),
  
  resetGame: () => set({
    currentStage: 1,
    score: 0,
    lives: 3,
    isPlaying: false,
    isPaused: false,
  }),

  // Stages
  setStages: (stages) => set({ stages }),
  unlockStage: (stageId) => set((state) => {
    const newStages = state.stages.map(stage =>
      stage.id === stageId ? { ...stage, isUnlocked: true } : stage
    );
    if (state.user) {
      fetch('/api/game/stages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.uuid,
          stageId,
          isUnlocked: true,
        }),
      }).catch(console.error);
    }
    return { stages: newStages };
  }),
  completeStage: (stageId) => set((state) => {
    const newStages = state.stages.map(stage =>
      stage.id === stageId ? { ...stage, isCompleted: true } : stage
    );
    if (state.user) {
      fetch('/api/game/stages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.uuid,
          stageId,
          isCompleted: true,
        }),
      }).catch(console.error);
    }
    return { stages: newStages };
  }),

  // Quests
  setQuests: (quests) => set({ quests }),
  updateQuestProgress: (questId, progress) => set((state) => {
    const newQuests = state.quests.map(quest =>
      quest.id === questId ? { ...quest, progress } : quest
    );
    if (state.user) {
      fetch('/api/game/quests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.uuid,
          questId,
          progress,
        }),
      }).catch(console.error);
    }
    return { quests: newQuests };
  }),
  completeQuest: (questId) => set((state) => {
    const newQuests = state.quests.map(quest =>
      quest.id === questId ? { ...quest, isCompleted: true, progress: quest.maxProgress } : quest
    );
    if (state.user) {
      fetch('/api/game/quests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: state.user.uuid,
          questId,
          isCompleted: true,
        }),
      }).catch(console.error);
    }
    return { quests: newQuests };
  }),
})); 