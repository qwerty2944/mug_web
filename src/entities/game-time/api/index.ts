import { supabase } from "@/shared/api";
import type { GameSettings } from "../types";

/**
 * 게임 설정을 조회합니다.
 */
export async function fetchGameSettings(): Promise<GameSettings | null> {
  const { data, error } = await supabase
    .from("game_settings")
    .select("*")
    .eq("id", "global")
    .single();

  if (error) {
    console.error("[GameSettings] Fetch error:", error);
    return null;
  }

  return data as GameSettings;
}
