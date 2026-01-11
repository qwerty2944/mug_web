/**
 * public 폴더에서 게임 데이터 JSON을 가져오는 유틸리티
 */

import type {
  EyeMapping,
  HairMapping,
  FacehairMapping,
  BodyMapping,
  EyeMappingFile,
  HairMappingFile,
  FacehairMappingFile,
  BodyMappingFile,
  AllMappings,
} from "../types/game-data";

// 캐시 (메모리)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

// ============ 내부 유틸리티 ============

async function fetchFromPublic<T>(path: string): Promise<T | null> {
  // 캐시 확인
  const cached = cache.get(path);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  try {
    const response = await fetch(`/data/${path}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();

    // 캐시에 저장
    cache.set(path, { data: json, timestamp: Date.now() });

    return json as T;
  } catch (error) {
    console.error(`Failed to fetch ${path}:`, error);
    return null;
  }
}

// ============ 데이터 API ============

export async function getEyeMappings(): Promise<EyeMapping[]> {
  const data = await fetchFromPublic<EyeMappingFile>("sprites/appearance/eye.json");
  return data?.eyes ?? [];
}

export async function getHairMappings(): Promise<HairMapping[]> {
  const data = await fetchFromPublic<HairMappingFile>("sprites/appearance/hair.json");
  return data?.hairs ?? [];
}

export async function getFacehairMappings(): Promise<FacehairMapping[]> {
  const data = await fetchFromPublic<FacehairMappingFile>("sprites/appearance/facehair.json");
  return data?.facehairs ?? [];
}

export async function getBodyMappings(): Promise<BodyMapping[]> {
  const data = await fetchFromPublic<BodyMappingFile>("sprites/appearance/body.json");
  return data?.bodies ?? [];
}

export async function getAllMappings(): Promise<AllMappings> {
  const [eyes, hairs, facehairs, bodies] = await Promise.all([
    getEyeMappings(),
    getHairMappings(),
    getFacehairMappings(),
    getBodyMappings(),
  ]);

  return { eyes, hairs, facehairs, bodies };
}

export function clearMappingCache(): void {
  cache.clear();
}
