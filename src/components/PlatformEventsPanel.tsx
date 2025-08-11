'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface PlatformEvent {
  _id: string;
  userId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  timestamp: string;
  status: 'pending' | 'sent' | 'failed' | 'retry';
  isSentToPlatform: boolean;
  sentToPlatformAt?: string;
  retryCount: number;
  errorMessage?: string;
}

export function PlatformEventsPanel() {
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/platform/events?limit=20');
      const result = await response.json();
      if (result.success) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch platform events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'retry':
        return <RefreshCw className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'retry':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ko-KR');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>플랫폼 이벤트</CardTitle>
            <CardDescription>
              플랫폼으로 전송된 이벤트들을 확인하세요.
            </CardDescription>
          </div>
          <Button onClick={fetchEvents} disabled={loading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              플랫폼 이벤트가 없습니다.
            </div>
          ) : (
            events.map((event) => (
              <Card key={event._id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(event.status)}
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        <Badge variant="outline">
                          {event.eventType}
                        </Badge>
                        {event.retryCount > 0 && (
                          <Badge variant="secondary">
                            재시도: {event.retryCount}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <p><strong>사용자 ID:</strong> {event.userId}</p>
                        <p><strong>시간:</strong> {formatTimestamp(event.timestamp)}</p>
                        {event.sentToPlatformAt && (
                          <p><strong>전송 시간:</strong> {formatTimestamp(event.sentToPlatformAt)}</p>
                        )}
                        {event.errorMessage && (
                          <p className="text-red-600"><strong>오류:</strong> {event.errorMessage}</p>
                        )}
                      </div>

                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-gray-600">
                          이벤트 데이터 보기
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                          {JSON.stringify(event.eventData, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 