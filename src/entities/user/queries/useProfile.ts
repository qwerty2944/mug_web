"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProfile, calculateCurrentStamina } from "../api";
import type { UserProfile } from "../types";
import type { SavedCharacter } from "@/entities/character";
import { getExpForLevel } from "../types/constants";

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
    staleTime: 30 * 1000, // 30초
    refetchInterval: 60 * 1000, // 1분마다 리프레시 (피로도 회복 반영)
  });
}

// ============ Helper Functions ============

/**
 * 캐릭터 가져오기
 */
export function getMainCharacter(profile: UserProfile | undefined): SavedCharacter | null {
  return profile?.character ?? null;
}

/**
 * CON 스탯 기반 최대 피로도 계산
 * 공식: 50 + (CON * 5)
 * CON 10 = 100, CON 15 = 125, CON 20 = 150
 */
export function calculateMaxStamina(con: number = 10): number {
  return 50 + con * 5;
}

/**
 * 프로필에서 CON 기반 최대 피로도 가져오기
 */
export function getMaxStaminaFromProfile(profile: UserProfile | undefined): number {
  if (!profile) return 100;
  const mainChar = getMainCharacter(profile);
  const con = mainChar?.stats?.con ?? 10;
  return calculateMaxStamina(con);
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
 * 현재 스태미나 계산 (Lazy Calculation)
 * DB에 저장된 값 + 경과 시간 기반 회복량
 */
export function getCurrentStamina(profile: UserProfile | undefined): number {
  if (!profile) return 100;
  return calculateCurrentStamina(
    profile.stamina,
    profile.staminaUpdatedAt,
    profile.maxStamina
  );
}

/**
 * 피로도 퍼센트 계산 (Lazy Calculation 적용)
 * CON 기반 최대 피로도를 사용하여 정확한 비율 계산
 */
export function getStaminaPercent(profile: UserProfile | undefined): number {
  if (!profile) return 100;
  const current = getCurrentStamina(profile);
  const maxStamina = getMaxStaminaFromProfile(profile);
  return Math.round((current / maxStamina) * 100);
}

/**
 * 스태미나 회복 계산 (클라이언트 시간 기반)
 * @deprecated getCurrentStamina 사용 권장
 */
export function calculateRecoveredStamina(profile: UserProfile): {
  stamina: number;
  staminaUpdatedAt: string;
} {
  const current = getCurrentStamina(profile);
  return {
    stamina: current,
    staminaUpdatedAt: profile.staminaUpdatedAt,
  };
}

// getExpForLevel is imported from types/constants
