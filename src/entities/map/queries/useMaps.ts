"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMaps } from "../api";
import type { GameMap } from "../types";

// ============ Query Keys ============

export const mapsKeys = {
  all: ["maps"] as const,
};

// ============ Query Hook ============

export function useMaps() {
  return useQuery({
    queryKey: mapsKeys.all,
    queryFn: fetchMaps,
    staleTime: 5 * 60 * 1000, // 5분 (맵 데이터는 자주 안 바뀜)
  });
}

// ============ Helper Functions ============

/**
 * ID로 맵 찾기
 */
export function getMapById(maps: GameMap[] | undefined, id: string): GameMap | undefined {
  return maps?.find((m) => m.id === id);
}

/**
 * 연결된 맵 목록 가져오기
 */
export function getConnectedMaps(maps: GameMap[] | undefined, currentMapId: string): GameMap[] {
  if (!maps) return [];
  const currentMap = getMapById(maps, currentMapId);
  if (!currentMap) return [];

  return currentMap.connectedMaps
    .map((id) => maps.find((m) => m.id === id))
    .filter((m): m is GameMap => m !== undefined);
}

/**
 * 맵 표시 이름 가져오기
 */
export function getMapDisplayName(map: GameMap, locale: "ko" | "en" = "ko"): string {
  return locale === "ko" ? map.nameKo : map.nameEn;
}

/**
 * 맵 설명 가져오기
 */
export function getMapDescription(map: GameMap, locale: "ko" | "en" = "ko"): string {
  const desc = locale === "ko" ? map.descriptionKo : map.descriptionEn;
  return desc || "";
}
