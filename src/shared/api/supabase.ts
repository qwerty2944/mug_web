import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://krwmncolecywlkmlviqu.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
