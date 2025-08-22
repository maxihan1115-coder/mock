#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== AppPass start probe ===');

// 1. 환경 변수 확인
const envVars = ['PORT', 'APP_PORT', 'NEXT_PORT', 'VITE_PORT', 'NODE_PORT'];
envVars.forEach(envVar => {
  console.log(`[env] ${envVar}=<${process.env[envVar] || 'undefined'}>`);
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
      timeout: 300000 // 5분 타임아웃
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
  execSync(`next start -p ${port}`, { 
    stdio: 'inherit',
    timeout: 60000 // 1분 타임아웃
  });
} catch (e) {
  console.error('[fatal] next start failed');
  console.error(e?.message || e);
  
  // 현재 디렉토리 내용 출력
  console.log('[debug] current directory contents:');
  try {
    execSync('ls -la', { stdio: 'inherit' });
  } catch {}
  
  process.exit(1);
}


