import type { GameMap } from "../types";

// ============ 맵 API ============

interface MapsJson {
  version: string;
  generatedAt: string;
  maps: GameMap[];
  summary: Record<string, unknown>;
}

/**
 * public/data/world/maps.json에서 맵 데이터 로드
 */
export async function fetchMaps(): Promise<GameMap[]> {
  const res = await fetch("/data/world/maps.json");
  if (!res.ok) {
    throw new Error(`Failed to fetch maps: ${res.status}`);
  }

  const data: MapsJson = await res.json();

  // minLevel 기준 정렬
  return data.maps.sort((a, b) => a.minLevel - b.minLevel);
}
