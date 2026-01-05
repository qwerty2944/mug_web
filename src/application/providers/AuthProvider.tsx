"use client";

import { useEffect, useState } from "react";
import {
  getSession,
  subscribeToAuthChanges,
  isAuthAvailable,
} from "@/shared/api";
import { useAuthStore } from "@/application/stores";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Supabase가 없으면 (환경변수 미설정) 스킵
    if (!isAuthAvailable()) {
      setIsLoading(false);
      return;
    }

    // 현재 세션 조회
    getSession().then((session) => {
      setSession(session);
      setIsLoading(false);
    });

    // 인증 상태 변경 구독
    const subscription = subscribeToAuthChanges((session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, [setSession]);

  // 로딩 중에는 children을 렌더링하지 않거나, 필요시 로딩 UI 표시 가능
  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
