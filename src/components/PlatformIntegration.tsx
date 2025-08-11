'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Copy, CheckCircle, AlertCircle, Link, Unlink } from 'lucide-react';
import { toast } from 'sonner';

interface PlatformCodeResponse {
  success: boolean;
  data?: {
    temporaryCode: string;
    outlink: string;
    expiresAt: string;
  };
  error?: string;
}

export default function PlatformIntegration() {
  const [uuid, setUuid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [platformData, setPlatformData] = useState<PlatformCodeResponse['data'] | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Connect/Disconnect 관련 상태
  const [connectAuth, setConnectAuth] = useState('');
  const [connectRequestCode, setConnectRequestCode] = useState('');
  const [disconnectAuth, setDisconnectAuth] = useState('');
  const [disconnectUuid, setDisconnectUuid] = useState('');

  const handleValidateUuid = async () => {
    if (!uuid.trim()) {
      toast.error('UUID를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/platform/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('UUID 검증 성공');
      } else {
        toast.error(data.error || 'UUID 검증 실패');
      }
    } catch (error) {
      toast.error('UUID 검증 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCode = async () => {
    if (!uuid.trim()) {
      toast.error('UUID를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔄 서버 API 호출 시작');
      const response = await fetch('/api/platform/request-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      console.log('📡 서버 응답 상태:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PlatformCodeResponse = await response.json();
      console.log('📥 서버 응답 데이터:', data);

      if (data.success && data.data) {
        setPlatformData(data.data);
        toast.success('임시 코드 생성 성공');
      } else {
        console.log('❌ 서버 API 실패:', data.error);
        toast.error(data.error || '임시 코드 생성 실패');
      }
    } catch (error) {
      console.error('❌ API 호출 실패:', error);
      toast.error('임시 코드 생성 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOutlink = async () => {
    if (!platformData?.outlink) return;

    try {
      await navigator.clipboard.writeText(platformData.outlink);
      setCopied(true);
      toast.success('아웃링크가 클립보드에 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('클립보드 복사에 실패했습니다');
    }
  };

  const handleOpenOutlink = () => {
    if (!platformData?.outlink) return;
    window.open(platformData.outlink, '_blank');
  };

  // Connect 기능
  const handleConnect = async () => {
    if (!connectAuth.trim() || !connectRequestCode.trim()) {
      toast.error('Authorization과 Request Code를 모두 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      const authHeader = connectAuth?.startsWith('Bearer ') ? connectAuth : `Bearer ${connectAuth}`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLATFORM_API_BASE_URL || 'https://papi.boradeeps.cc'}/m/auth/v1/bapp/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          requestCode: connectRequestCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('연결 성공');
        console.log('Connect response:', data);
      } else {
        toast.error(data.error || '연결 실패');
      }
    } catch (error) {
      console.error('Connect error:', error);
      toast.error('연결 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect 기능
  const handleDisconnect = async () => {
    if (!disconnectAuth.trim() || !disconnectUuid.trim()) {
      toast.error('Authorization과 UUID를 모두 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      const authHeader = disconnectAuth?.startsWith('Bearer ') ? disconnectAuth : `Bearer ${disconnectAuth}`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_PLATFORM_API_BASE_URL || 'https://api.boradeeps.cc'}/m/auth/v1/bapp/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          uuid: disconnectUuid
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('연결 해제 성공');
        console.log('Disconnect response:', data);
      } else {
        toast.error(data.error || '연결 해제 실패');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('연결 해제 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            플랫폼 연동
          </CardTitle>
          <CardDescription>
            게임 클라이언트에서 플랫폼으로의 연동을 관리합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* UUID 입력 섹션 */}
          <div className="space-y-2">
            <Label htmlFor="uuid">게임 UUID (계정명)</Label>
            <div className="flex gap-2">
              <Input
                id="uuid"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                placeholder="게임 UUID (계정명)를 입력하세요"
              />
              <Button
                onClick={handleValidateUuid}
                disabled={isLoading}
                variant="outline"
              >
                검증
              </Button>
            </div>
          </div>

          {/* 임시 코드 요청 버튼 */}
          <Button
            onClick={handleRequestCode}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '처리 중...' : '임시 코드 요청'}
          </Button>
        </CardContent>
      </Card>

      {/* Connect 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-blue-500" />
            플랫폼 연결
          </CardTitle>
          <CardDescription>
            플랫폼과 연결을 설정합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connectAuth">Authorization</Label>
            <Input
              id="connectAuth"
              value={connectAuth}
              onChange={(e) => setConnectAuth(e.target.value)}
              placeholder="Bearer aa61e7cf-7f32-40c4-992a-074284275d7c:286"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="connectRequestCode">Request Code</Label>
            <Input
              id="connectRequestCode"
              value={connectRequestCode}
              onChange={(e) => setConnectRequestCode(e.target.value)}
              placeholder="3cfb7996-df06-4c5b-8d69-7ecb25b5516b"
            />
          </div>

          <Button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '연결 중...' : '연결'}
          </Button>
        </CardContent>
      </Card>

      {/* Disconnect 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlink className="h-5 w-5 text-red-500" />
            플랫폼 연결 해제
          </CardTitle>
          <CardDescription>
            플랫폼과의 연결을 해제합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disconnectAuth">Authorization</Label>
            <Input
              id="disconnectAuth"
              value={disconnectAuth}
              onChange={(e) => setDisconnectAuth(e.target.value)}
              placeholder="Basic NFpRSVFhZ1BZdUpNbGV5bjpqVFZmZEwzd0piN0dOUzR0QjBtbkw0Q3EzblV6QWFRcQ=="
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="disconnectUuid">UUID</Label>
            <Input
              id="disconnectUuid"
              value={disconnectUuid}
              onChange={(e) => setDisconnectUuid(e.target.value)}
              placeholder="2"
            />
          </div>

          <Button
            onClick={handleDisconnect}
            disabled={isLoading}
            variant="destructive"
            className="w-full"
          >
            {isLoading ? '해제 중...' : '연결 해제'}
          </Button>
        </CardContent>
      </Card>

      {/* 결과 표시 */}
      {platformData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              플랫폼 연동 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>임시 코드</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                <code className="text-sm">{platformData.temporaryCode}</code>
              </div>
            </div>

            <div className="space-y-2">
              <Label>아웃링크</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={platformData.outlink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={handleCopyOutlink}
                  variant="outline"
                  size="sm"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={handleOpenOutlink}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>만료 시간</Label>
              <p className="text-sm text-gray-600">
                {new Date(platformData.expiresAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 