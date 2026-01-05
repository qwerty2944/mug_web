"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "../api";
import type { UserProfile } from "../types";
import type { SavedCharacter } from "@/entities/character";

// ============ Query Keys ============

export const profileKeys = {
  all: ["profile"] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

// ============ Query Hook ============

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId || ""),
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1분
  });
}

// ============ Helper Functions ============

/**
 * 메인 캐릭터 가져오기
 */
export function getMainCharacter(profile: UserProfile | undefined): SavedCharacter | null {
  if (!profile?.characters?.length) return null;
  return profile.characters.find((c) => c.isMain) || profile.characters[0];
}

/**
 * 경험치 퍼센트 계산
 */
export function getExpPercentage(profile: UserProfile | undefined): number {
  if (!profile) return 0;
  const expNeeded = getExpForLevel(profile.level);
  return Math.min((profile.experience / expNeeded) * 100, 100);
}

/**
 * 다음 레벨까지 필요 경험치
 */
export function getExpToNextLevel(profile: UserProfile | undefined): number {
  if (!profile) return 0;
  return getExpForLevel(profile.level) - profile.experience;
}

/**
 * 스태미나 퍼센트 계산
 */
export function getStaminaPercent(profile: UserProfile | undefined): number {
  if (!profile) return 100;
  return Math.round((profile.stamina / profile.maxStamina) * 100);
}

/**
 * 스태미나 회복 계산 (클라이언트 시간 기반)
 */
export function calculateRecoveredStamina(profile: UserProfile): {
  stamina: number;
  staminaUpdatedAt: string;
} {
  const now = new Date();
  const lastUpdate = new Date(profile.staminaUpdatedAt);
  const minutesPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000);
  const STAMINA_RECOVERY_PER_MINUTE = 1;

  if (minutesPassed > 0 && profile.stamina < profile.maxStamina) {
    const recovered = Math.min(
      minutesPassed * STAMINA_RECOVERY_PER_MINUTE,
      profile.maxStamina - profile.stamina
    );

    return {
      stamina: profile.stamina + recovered,
      staminaUpdatedAt: now.toISOString(),
    };
  }

  return {
    stamina: profile.stamina,
    staminaUpdatedAt: profile.staminaUpdatedAt,
  };
}

// ============ Private Helpers ============

function getExpForLevel(level: number): number {
  return level * 100;
}
