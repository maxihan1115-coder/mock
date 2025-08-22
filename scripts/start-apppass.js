#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    execSync('npm run build', { 
      stdio: 'inherit',
      timeout: 600000 // 10분 타임아웃으로 증가
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
    NEXT_TELEMETRY_DISABLED: '1'
  };
  
  console.log('[exec] 환경 변수 설정 완료:', {
    PORT: env.PORT,
    NODE_ENV: env.NODE_ENV,
    NEXT_TELEMETRY_DISABLED: env.NEXT_TELEMETRY_DISABLED
  });
  
  // 프로세스 시작 전 메모리 상태 확인
  console.log('[exec] 서버 시작 전 메모리 상태:', process.memoryUsage());
  
  execSync(`next start -p ${port}`, { 
    stdio: 'inherit',
    timeout: 120000, // 2분 타임아웃으로 증가
    env: env
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


