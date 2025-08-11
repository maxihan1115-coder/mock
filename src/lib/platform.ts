import { v4 as uuidv4 } from 'uuid';

export interface PlatformRequestCodeResponse {
  success: boolean;
  code?: string;
  error?: string;
}

export interface PlatformCode {
  code: string;
  expiresAt: Date;
}

/**
 * API 키 생성 (UUIDv4 형식)
 */
export function generateApiKey(): string {
  return uuidv4();
}

/**
 * API 키 검증
 */
export function validateApiKey(apiKey: string): boolean {
  // UUIDv4 형식 검증
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(apiKey);
}

/**
 * 플랫폼 API에 임시 코드 요청
 */
export async function requestPlatformCode(uuid: string): Promise<PlatformRequestCodeResponse> {
  const apiUrl = `${process.env.PLATFORM_API_BASE_URL}/m/auth/v1/bapp/request-code?uuid=${uuid}`;
  
  const authToken = process.env.PLATFORM_API_AUTH_TOKEN;
  const authHeader = authToken?.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
  
  console.log('🚀 플랫폼 API 호출 시작:', {
    url: apiUrl,
    uuid: uuid,
    authToken: authToken ? '설정됨' : '설정안됨',
    authHeader: authHeader ? `${authHeader.substring(0, 20)}...` : '없음',
    baseUrl: process.env.PLATFORM_API_BASE_URL
  });

  try {
    // 인증 헤더 구성 (이미 위에서 선언됨)
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 플랫폼 API 응답:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 플랫폼 API 오류:', {
        status: response.status,
        error: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ 플랫폼 API 성공:', {
      receivedCode: data.code,
      dataKeys: Object.keys(data),
      fullData: data
    });

    // 플랫폼 API 응답 구조에 따라 코드 추출
    let code = data.code;
    
    // 다른 가능한 필드들 확인
    if (!code && data.payload) {
      // payload가 문자열이면 직접 코드
      if (typeof data.payload === 'string') {
        code = data.payload;
      } else if (data.payload.code) {
        code = data.payload.code;
      }
    }
    if (!code && data.data) {
      code = data.data.code;
    }
    if (!code && data.requestCode) {
      code = data.requestCode;
    }
    
    console.log('🔍 추출된 코드:', code);

    return {
      success: true,
      code: code,
    };
  } catch (error) {
    console.error('❌ 플랫폼 API 요청 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * UUIDv4 형식의 임시 코드 생성
 */
export function generateTemporaryCode(): string {
  return uuidv4();
}

/**
 * 플랫폼 웹페이지 아웃링크 생성
 */
export function createPlatformOutlink(requestCode: string): string {
  return `${process.env.PLATFORM_WEB_URL}/?requestCode=${requestCode}`;
}

/**
 * 임시 코드의 유효기간 확인 (15분)
 */
export function isCodeValid(createdAt: Date): boolean {
  const now = new Date();
  const expirationTime = new Date(createdAt.getTime() + 15 * 60 * 1000); // 15분
  return now < expirationTime;
} 