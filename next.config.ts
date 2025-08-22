import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    CUSTOM_KEY: 'my-value',
  },
  // 배포 환경에서 포트 설정
  serverExternalPackages: ['@prisma/client'],
  // AppPass 배포 환경 최적화
  experimental: {
    // 서버 컴포넌트 최적화 (deprecated 경고 해결)
  },
  // AppPass 환경 최적화
  poweredByHeader: false,
  compress: true,
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
