/**
 * Supabase Storage 설정
 *
 * 현재 개발 중이므로 사용하지 않음.
 * 프로덕션 배포 시 활성화하여 Supabase Storage에서 데이터 로드.
 */

export const STORAGE_CONFIG = {
  BUCKET_NAME: "game-data",
  MAPPING_PATH: "mappings",
  CACHE_TTL: 5 * 60 * 1000, // 5분
} as const;

export const MAPPING_FILES = {
  EYE: "eye-mapping.json",
  HAIR: "hair-mapping.json",
  FACEHAIR: "facehair-mapping.json",
  BODY: "body-mapping.json",
} as const;

/**
 * 사용 예시 (프로덕션 배포 시):
 *
 * import { supabase } from "@/shared/api/supabase";
 * import { STORAGE_CONFIG } from "@/shared/config/storage";
 *
 * async function fetchFromStorage<T>(fileName: string): Promise<T> {
 *   const { data, error } = await supabase.storage
 *     .from(STORAGE_CONFIG.BUCKET_NAME)
 *     .download(`${STORAGE_CONFIG.MAPPING_PATH}/${fileName}`);
 *
 *   if (error || !data) {
 *     throw new Error(`Failed to fetch from storage: ${error?.message}`);
 *   }
 *
 *   const text = await data.text();
 *   return JSON.parse(text) as T;
 * }
 */
