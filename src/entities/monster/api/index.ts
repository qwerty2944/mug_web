import { supabase } from "@/shared/api/supabase";
import { STORAGE_CONFIG } from "@/shared/config/storage";
import type { Monster, MonstersData } from "../types";

// 메모리 캐시
let monstersCache: Monster[] | null = null;
let cacheTimestamp: number = 0;

/**
 * Supabase Storage에서 몬스터 데이터 가져오기
 */
async function fetchFromStorage(): Promise<Monster[]> {
  const { data, error } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .download(`${STORAGE_CONFIG.MAPPING_PATH}/monsters.json`);

  if (error || !data) {
    throw new Error(`Failed to fetch monsters from storage: ${error?.message}`);
  }

  const text = await data.text();
  const parsed: MonstersData = JSON.parse(text);
  return parsed.monsters;
}

/**
 * 로컬 fallback에서 몬스터 데이터 가져오기
 */
async function fetchFromLocal(): Promise<Monster[]> {
  const response = await fetch("/data/monsters/monsters.json");
  if (!response.ok) {
    throw new Error("Failed to fetch monsters from local");
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
  if (monstersCache && now - cacheTimestamp < STORAGE_CONFIG.CACHE_TTL) {
    return monstersCache;
  }

  try {
    // Storage에서 먼저 시도
    monstersCache = await fetchFromStorage();
  } catch {
    // 실패 시 로컬 fallback
    console.warn("Falling back to local monsters.json");
    monstersCache = await fetchFromLocal();
  }

  cacheTimestamp = now;
  return monstersCache;
}

/**
 * 특정 맵의 몬스터 조회
 */
export async function fetchMonstersByMap(mapId: string): Promise<Monster[]> {
  const monsters = await fetchMonsters();
  return monsters.filter((m) => m.mapId === mapId);
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
