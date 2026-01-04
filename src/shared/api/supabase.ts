import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://krwmncolecywlkmlviqu.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 빌드 시 환경변수가 없어도 에러 없이 작동 (런타임에만 실제 사용)
export const supabase: SupabaseClient = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient);

// 타입 정의
export interface BodyMapping {
  index: number;
  fileName: string;
  ko: string;
  en: string;
  race: string;
}

export interface BodyMappingData {
  version: string;
  generatedAt: string;
  bodies: BodyMapping[];
  summary: {
    total: number;
    byRace: Record<string, number>;
  };
}

// 바디 매핑 가져오기
export async function getBodyMapping(): Promise<BodyMappingData | null> {
  const { data, error } = await supabase.storage
    .from("game-data")
    .download("mappings/body-mapping.json");

  if (error) {
    console.error("Failed to fetch body mapping:", error);
    return null;
  }

  const text = await data.text();
  return JSON.parse(text) as BodyMappingData;
}
