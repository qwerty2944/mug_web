import { supabase } from "./supabase";
import type { Session, Subscription } from "@supabase/supabase-js";

// ============ 타입 ============

export type AuthSession = Session | null;

export interface AuthSubscription {
  unsubscribe: () => void;
}

// ============ API ============

/**
 * 현재 세션 조회
 */
export async function getSession(): Promise<AuthSession> {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Failed to get session:", error);
    return null;
  }

  return data.session;
}

/**
 * 인증 상태 변경 구독
 */
export function subscribeToAuthChanges(
  callback: (session: AuthSession) => void
): AuthSubscription | null {
  if (!supabase) return null;

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return {
    unsubscribe: () => subscription.unsubscribe(),
  };
}

/**
 * Supabase 클라이언트 사용 가능 여부
 */
export function isAuthAvailable(): boolean {
  return supabase !== null;
}
