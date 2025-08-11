# 플랫폼 연동 QA 목업 게임

내부 플랫폼 연동 QA를 위한 스테이지 게임 목업입니다. 마리오, 원더보이와 같은 플랫폼 게임 형태로 구성되어 있습니다.

## 주요 기능

### 🔐 인증 시스템
- 사용자명 기반 로그인 (비밀번호는 아무거나 입력 가능)
- 각 사용자마다 고유 UUID 생성
- 로그인/로그아웃 기능

### 🎮 게임 시스템
- 4개의 스테이지 (숲의 시작, 동굴 탐험, 산의 정상, 용의 둥지)
- 점프, 이동, 아이템 수집 등 기본적인 플랫폼 게임 메커니즘
- 점수 시스템 및 생명 시스템
- 스테이지별 난이도 차별화

### 📊 퀘스트 시스템
- 일일, 주간, 업적 퀘스트
- 퀘스트 진행도 추적
- 퀘스트 완료 보상 시스템

### 🔌 API 연동
- 플랫폼과의 Server-to-Server 통신을 위한 API 엔드포인트
- 로그인, 스테이지 완료, 퀘스트 완료, 점수 업데이트 이벤트
- 플랫폼 이벤트 리스너 (콘솔 로그로 확인 가능)

## API 엔드포인트

### 인증
- `POST /api/auth/login` - 사용자 로그인

### 게임
- `POST /api/game/stage/complete` - 스테이지 완료
- `POST /api/game/quest/complete` - 퀘스트 완료
- `POST /api/game/score/update` - 점수 업데이트

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: Sonner

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 게임 조작법

- **이동**: 방향키 또는 WASD
- **점프**: 스페이스바, W, 또는 ↑
- **목표**: 초록색 목표 지점에 도달

## 플랫폼 연동 테스트

1. 사용자 로그인 후 게임 플레이
2. 스테이지 완료 시 자동으로 API 호출
3. 퀘스트 완료 시 API 호출
4. 점수 업데이트 API 테스트 버튼으로 수동 테스트 가능
5. 브라우저 개발자 도구 콘솔에서 플랫폼 이벤트 확인

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── auth/          # 인증 관련 API
│   │   └── game/          # 게임 관련 API
│   └── page.tsx           # 메인 페이지
├── components/             # React 컴포넌트
│   ├── ui/                # ShadCN UI 컴포넌트
│   ├── LoginForm.tsx      # 로그인 폼
│   ├── GameCanvas.tsx     # 게임 캔버스
│   ├── StageSelect.tsx    # 스테이지 선택
│   └── QuestPanel.tsx     # 퀘스트 패널
├── lib/                   # 유틸리티
│   ├── store.ts           # Zustand 스토어
│   └── utils.ts           # 유틸리티 함수
└── types/                 # TypeScript 타입 정의
    └── game.ts            # 게임 관련 타입
```

## 개발 가이드

### 새로운 스테이지 추가
1. `src/lib/store.ts`의 `initialStages` 배열에 스테이지 정보 추가
2. `src/components/GameCanvas.tsx`의 스테이지별 장애물 설정 로직 수정

### 새로운 퀘스트 추가
1. `src/lib/store.ts`의 `initialQuests` 배열에 퀘스트 정보 추가
2. 퀘스트 타입과 요구사항 정의

### API 엔드포인트 추가
1. `src/app/api/` 디렉토리에 새로운 라우트 파일 생성
2. 플랫폼 이벤트 발생 로직 추가

## 라이센스

이 프로젝트는 내부 QA 목적으로만 사용됩니다.
