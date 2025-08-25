#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 프로세스 종료 시그널 처리
process.on('SIGTERM', () => {
  console.log('[signal] SIGTERM received, shutting down gracefully...');
  console.log('[memory] 종료 전 메모리 상태:', process.memoryUsage());
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[signal] SIGINT received, shutting down gracefully...');
  console.log('[memory] 종료 전 메모리 상태:', process.memoryUsage());
  process.exit(0);
});

// 예상치 못한 오류 처리
process.on('uncaughtException', (error) => {
  console.error('[fatal] Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[fatal] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('=== AppPass start probe ===');

// 1. 시스템 정보 출력
console.log('[info] 시스템 정보:', {
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  memoryUsage: process.memoryUsage(),
  cwd: process.cwd(),
  pid: process.pid
});

// 2. 환경 변수 확인
const envVars = ['PORT', 'APP_PORT', 'NEXT_PORT', 'VITE_PORT', 'NODE_PORT'];
envVars.forEach(envVar => {
  console.log(`[env] ${envVar}=<${process.env[envVar] || 'undefined'}>`);
});

// 3. 중요 환경 변수 확인
console.log('[env] 중요 환경 변수:', {
  NODE_ENV: process.env.NODE_ENV || 'undefined',
  DATABASE_URL: process.env.DATABASE_URL ? '설정됨' : '설정안됨',
  PLATFORM_API_BASE_URL: process.env.PLATFORM_API_BASE_URL ? '설정됨' : '설정안됨',
  PLATFORM_API_AUTH_TOKEN: process.env.PLATFORM_API_AUTH_TOKEN ? '설정됨' : '설정안됨'
});

// 2. 전달된 인자 확인
const args = process.argv.slice(2);
console.log(`[args] provided: [${JSON.stringify(args)}] (ignored)`);

// 3. 포트 결정
let port = 3000;
for (const envVar of envVars) {
  if (process.env[envVar]) {
    port = parseInt(process.env[envVar]);
    break;
  }
}
console.log(`[probe] resolved port = ${port}`);

// 4. 빌드 확인 및 실행
console.log('[probe] ensuring production build exists (.next) ...');
let needBuild = false;
try {
  // BUILD_ID 존재 여부로 빌드 완료 판단
  execSync('test -f .next/BUILD_ID', { stdio: 'ignore' });
  console.log('[probe] .next/BUILD_ID found ✅');
} catch {
  needBuild = true;
  console.warn('[probe] .next/BUILD_ID not found. Running build...');
}

if (needBuild) {
  try {
    console.log('[probe] starting build process...');
    execSync('npx next build --no-lint --no-mangling --debug', { 
      stdio: 'inherit',
      timeout: 900000 // 15분 타임아웃으로 증가
    });
    console.log('[probe] build finished ✅');
  } catch (e) {
    console.error('[fatal] build failed');
    console.error(e?.message || e);
    
    // 현재 디렉토리 내용 출력
    console.log('[debug] current directory contents:');
    try {
      execSync('ls -la', { stdio: 'inherit' });
    } catch {}
    
    process.exit(1);
  }
}

// 5. 서버 시작
console.log(`[exec] next start -p ${port}`);
try {
  // 환경 변수 설정
  const env = {
    ...process.env,
    PORT: port.toString(),
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
    // 기본 환경변수 설정 (호스팅 환경에서 누락될 수 있음)
    DATABASE_URL: process.env.DATABASE_URL || 'mysql://localhost:3306/quest_mock_game',
    PLATFORM_API_BASE_URL: process.env.PLATFORM_API_BASE_URL || 'https://api.example.com',
    PLATFORM_API_AUTH_TOKEN: process.env.PLATFORM_API_AUTH_TOKEN || 'dummy-token',
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY || 'dummy-key'
  };
  
  console.log('[exec] 환경 변수 설정 완료:', {
    PORT: env.PORT,
    NODE_ENV: env.NODE_ENV,
    NEXT_TELEMETRY_DISABLED: env.NEXT_TELEMETRY_DISABLED
  });
  
  // 프로세스 시작 전 메모리 상태 확인
  console.log('[exec] 서버 시작 전 메모리 상태:', process.memoryUsage());
  
  // spawn을 사용하여 프로세스 관리 개선
  const serverProcess = spawn('next', ['start', '-p', port.toString()], {
    stdio: 'inherit',
    env: env,
    detached: false // 부모 프로세스와 함께 종료되도록 설정
  });
  
  // 서버 프로세스 종료 처리
  serverProcess.on('close', (code, signal) => {
    console.log(`[server] 서버 프로세스 종료 - 코드: ${code}, 시그널: ${signal}`);
    console.log('[memory] 서버 종료 시 메모리 상태:', process.memoryUsage());
    process.exit(code || 0);
  });
  
  serverProcess.on('error', (error) => {
    console.error('[server] 서버 프로세스 오류:', error);
    process.exit(1);
  });
  
  // 현재 프로세스가 종료될 때 서버 프로세스도 함께 종료
  process.on('exit', () => {
    console.log('[signal] 메인 프로세스 종료, 서버 프로세스도 종료합니다.');
    console.log('[memory] 최종 메모리 상태:', process.memoryUsage());
    if (!serverProcess.killed) {
      serverProcess.kill('SIGTERM');
    }
  });
  
} catch (e) {
  console.error('[fatal] next start failed');
  console.error('[fatal] 에러 타입:', e?.constructor?.name);
  console.error('[fatal] 에러 메시지:', e?.message || e);
  console.error('[fatal] 에러 코드:', e?.code);
  console.error('[fatal] 에러 시그널:', e?.signal);
  
  // 현재 디렉토리 내용 출력
  console.log('[debug] current directory contents:');
  try {
    execSync('ls -la', { stdio: 'inherit' });
  } catch {}
  
  // .next 디렉토리 내용 확인
  console.log('[debug] .next directory contents:');
  try {
    execSync('ls -la .next/', { stdio: 'inherit' });
  } catch {}
  
  // package.json 확인
  console.log('[debug] package.json 내용:');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('[debug] scripts:', packageJson.scripts);
    console.log('[debug] dependencies:', Object.keys(packageJson.dependencies || {}));
  } catch (e) {
    console.error('[debug] package.json 읽기 실패:', e?.message);
  }
  
  // 프로세스 정보 확인
  console.log('[debug] 프로세스 정보:', {
    pid: process.pid,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
  
  process.exit(1);
}


