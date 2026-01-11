import type { Monster, MonstersData } from "../types";

// 메모리 캐시
let monstersCache: Monster[] | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5분
let cacheTimestamp: number = 0;

/**
 * public 폴더에서 몬스터 데이터 가져오기
 */
async function fetchFromPublic(): Promise<Monster[]> {
  const response = await fetch("/data/monsters/monsters.json");
  if (!response.ok) {
    throw new Error("Failed to fetch monsters");
  }
  const parsed: MonstersData = await response.json();
  return parsed.monsters;
}

/**
 * 모든 몬스터 조회
 */
export async function fetchMonsters(): Promise<Monster[]> {
  // 캐시 확인
  const now = Date.now();
  if (monstersCache && now - cacheTimestamp < CACHE_TTL) {
    return monstersCache;
  }

  monstersCache = await fetchFromPublic();
  cacheTimestamp = now;
  return monstersCache;
}

/**
 * 특정 맵의 몬스터 조회
 */
export async function fetchMonstersByMap(mapId: string): Promise<Monster[]> {
  const monsters = await fetchMonsters();
  return monsters.filter((m) => m.mapIds.includes(mapId));
}

/**
 * ID로 몬스터 조회
 */
export async function fetchMonsterById(monsterId: string): Promise<Monster | null> {
  const monsters = await fetchMonsters();
  return monsters.find((m) => m.id === monsterId) || null;
}

/**
 * 캐시 초기화
 */
export function clearMonstersCache(): void {
  monstersCache = null;
  cacheTimestamp = 0;
}
