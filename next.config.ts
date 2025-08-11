import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    CUSTOM_KEY: 'my-value',
  },
  // 배포 환경에서 포트 설정
  serverExternalPackages: ['mongoose'],
  // 정적 파일 서빙 최적화
  output: 'standalone',
  // 헬스 체크를 위한 설정
  async headers() {
    return [
      {
        source: '/api/health',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
