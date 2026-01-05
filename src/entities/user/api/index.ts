import { supabase } from "@/shared/api";
import type { UserProfile } from "../types";

// ============ 프로필 API ============

export async function fetchProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    nickname: data.nickname,
    level: data.level || 1,
    experience: data.experience || 0,
    gold: data.gold || 0,
    gems: data.gems || 0,
    stamina: data.stamina || 100,
    maxStamina: data.max_stamina || 100,
    staminaUpdatedAt: data.stamina_updated_at || new Date().toISOString(),
    isPremium: data.is_premium || false,
    premiumUntil: data.premium_until,
    characters: data.characters || [],
    buffs: data.buffs || [],
  };
}
