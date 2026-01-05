/**
 * Supabase Storage에서 게임 데이터 JSON을 가져오는 유틸리티
 */

import { supabase } from "./supabase";
import { STORAGE_CONFIG, MAPPING_FILES } from "../config/storage";
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

// ============ 내부 유틸리티 ============

async function fetchFromStorage<T>(fileName: string): Promise<T | null> {
  // 캐시 확인
  const cached = cache.get(fileName);
  if (cached && Date.now() - cached.timestamp < STORAGE_CONFIG.CACHE_TTL) {
    return cached.data as T;
  }

  try {
    // Supabase Storage에서 가져오기
    const { data } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(`${STORAGE_CONFIG.MAPPING_PATH}/${fileName}`);

    const response = await fetch(data.publicUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();

    // 캐시에 저장
    cache.set(fileName, { data: json, timestamp: Date.now() });

    return json as T;
  } catch (error) {
    console.error(`Failed to fetch ${fileName} from storage:`, error);

    // 폴백: 로컬 public/data에서 가져오기
    try {
      const localResponse = await fetch(`/data/${fileName}`);
      if (localResponse.ok) {
        const json = await localResponse.json();
        cache.set(fileName, { data: json, timestamp: Date.now() });
        return json as T;
      }
    } catch {
      // 무시
    }

    return null;
  }
}

// ============ 데이터 API ============

export async function getEyeMappings(): Promise<EyeMapping[]> {
  const data = await fetchFromStorage<EyeMappingFile>(MAPPING_FILES.EYE);
  return data?.eyes ?? [];
}

export async function getHairMappings(): Promise<HairMapping[]> {
  const data = await fetchFromStorage<HairMappingFile>(MAPPING_FILES.HAIR);
  return data?.hairs ?? [];
}

export async function getFacehairMappings(): Promise<FacehairMapping[]> {
  const data = await fetchFromStorage<FacehairMappingFile>(MAPPING_FILES.FACEHAIR);
  return data?.facehairs ?? [];
}

export async function getBodyMappings(): Promise<BodyMapping[]> {
  const data = await fetchFromStorage<BodyMappingFile>(MAPPING_FILES.BODY);
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
