// Supabase Storage 설정

export const STORAGE_CONFIG = {
  BUCKET_NAME: "game-data",
  MAPPING_PATH: "mappings",
  CACHE_TTL: 5 * 60 * 1000, // 5분
} as const;

// 매핑 파일명
export const MAPPING_FILES = {
  EYE: "eye-mapping.json",
  HAIR: "hair-mapping.json",
  FACEHAIR: "facehair-mapping.json",
  BODY: "body-mapping.json",
} as const;
