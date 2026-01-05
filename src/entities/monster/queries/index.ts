"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMonsters, fetchMonstersByMap, fetchMonsterById } from "../api";
import type { Monster } from "../types";

// Query Keys
export const monsterKeys = {
  all: ["monsters"] as const,
  byMap: (mapId: string) => [...monsterKeys.all, "map", mapId] as const,
  detail: (id: string) => [...monsterKeys.all, "detail", id] as const,
};

/**
 * 모든 몬스터 조회 훅
 */
export function useMonsters() {
  return useQuery<Monster[], Error>({
    queryKey: monsterKeys.all,
    queryFn: fetchMonsters,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 특정 맵의 몬스터 조회 훅
 */
export function useMonstersByMap(mapId: string | undefined) {
  return useQuery<Monster[], Error>({
    queryKey: monsterKeys.byMap(mapId || ""),
    queryFn: () => fetchMonstersByMap(mapId!),
    enabled: !!mapId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * ID로 몬스터 조회 훅
 */
export function useMonster(monsterId: string | undefined) {
  return useQuery<Monster | null, Error>({
    queryKey: monsterKeys.detail(monsterId || ""),
    queryFn: () => fetchMonsterById(monsterId!),
    enabled: !!monsterId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============ 헬퍼 함수 ============

/**
 * 몬스터 표시 이름 (로케일 기반)
 */
export function getMonsterDisplayName(monster: Monster, locale: "ko" | "en" = "ko"): string {
  return locale === "ko" ? monster.nameKo : monster.nameEn;
}

/**
 * 몬스터 설명 (로케일 기반)
 */
export function getMonsterDescription(monster: Monster, locale: "ko" | "en" = "ko"): string {
  if (!monster.description) return "";
  return locale === "ko" ? monster.description.ko : monster.description.en;
}
