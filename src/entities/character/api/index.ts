import { supabase } from "@/shared/api";
import type { SavedCharacter } from "../types";

// ============ 캐릭터 API ============

export async function fetchCharacter(userId: string): Promise<SavedCharacter | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("character")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return (data?.character || null) as SavedCharacter | null;
}
