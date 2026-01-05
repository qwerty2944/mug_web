import { supabase } from "@/shared/api";
import type { SavedCharacter } from "../types";

// ============ 캐릭터 API ============

export async function fetchCharacters(userId: string): Promise<SavedCharacter[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("characters")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return (data?.characters || []) as SavedCharacter[];
}

export async function fetchMainCharacter(userId: string): Promise<SavedCharacter | null> {
  const characters = await fetchCharacters(userId);
  if (!characters.length) return null;
  return characters.find((c) => c.isMain) || characters[0];
}
