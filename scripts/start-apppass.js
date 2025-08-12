#!/usr/bin/env node
/*
  AppPass 런타임에서 포트 전달/작동 방식을 디버깅하기 위한 스타터.
  - 기대: PORT 또는 APP_PORT 환경변수로 포트가 전달됨
  - 백업: 3000
  - 실행 전 유효성 로그를 상세히 출력
*/

const { execSync } = require('node:child_process');

function logEnv(key) {
  const val = process.env[key];
  console.log(`[env] ${key}=${val ?? '<undefined>'}`);
}

function main() {
  console.log('=== AppPass start probe ===');
  // 대표적으로 쓰일 수 있는 포트 변수 후보들을 모두 출력
  ['PORT', 'APP_PORT', 'NEXT_PORT', 'VITE_PORT', 'NODE_PORT'].forEach(logEnv);

  // 잘못된 사용 사례 탐지: 명령행 인수에 숫자가 들어온 경우 (예: "next start 3000")
  const extraArgs = process.argv.slice(2);
  if (extraArgs.length) {
    console.log(`[args] provided: ${JSON.stringify(extraArgs)} (ignored)`);
  }

  // 포트 결정
  const port = process.env.PORT || process.env.APP_PORT || '3000';
  console.log(`[probe] resolved port = ${port}`);

  // AppPass에서 잘못된 형태로 "-p 3000 3000" 같이 들어오는 케이스를 탐지하기 위한 안내 로그
  if (String(port).includes('/')) {
    console.warn('[warn] PORT에 경로처럼 보이는 값이 들어왔습니다. 런처가 인자를 잘못 전달 중일 수 있습니다.');
  }

  // Next.js 실행 전 빌드 유무 체크 안내
  console.log('[probe] ensuring production build exists (.next) ...');
  try {
    execSync('test -d .next || echo "[hint] .next 폴더가 없습니다. 먼저 \"npm run build\"를 실행해야 합니다."', { stdio: 'inherit' });
  } catch {}

  // 최종 실행 커맨드
  const cmd = `next start -p ${port}`;
  console.log(`[exec] ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (err) {
    console.error('[fatal] next start failed');
    console.error(err?.message || err);
    // 추가 진단: 현재 작업 디렉토리, 파일목록
    try { execSync('pwd && ls -la | head -100', { stdio: 'inherit' }); } catch {}
    process.exit(1);
  }
}

main();


