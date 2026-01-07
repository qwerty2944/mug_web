import { supabase } from "@/shared/api";
import type { UserProfile, CrystalTier } from "../types";

// ============ 프로필 조회 API ============

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
    currentMapId: data.current_map_id || "town_square",
    whisperCharges: data.whisper_charges || 0,
    crystalTier: (data.crystal_tier as CrystalTier) || null,
  };
}

// ============ 위치 업데이트 API ============

export async function updateCurrentMap(userId: string, mapId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ current_map_id: mapId })
    .eq("id", userId);

  if (error) throw error;
}

// ============ 프로필 업데이트 API ============

export interface UpdateProfileParams {
  userId: string;
  level?: number;
  experience?: number;
  gold?: number;
  stamina?: number;
  staminaUpdatedAt?: string;
}

export async function updateProfile(params: UpdateProfileParams): Promise<void> {
  const { userId, ...updates } = params;

  // snake_case 변환
  const dbUpdates: Record<string, unknown> = {};
  if (updates.level !== undefined) dbUpdates.level = updates.level;
  if (updates.experience !== undefined) dbUpdates.experience = updates.experience;
  if (updates.gold !== undefined) dbUpdates.gold = updates.gold;
  if (updates.stamina !== undefined) dbUpdates.stamina = updates.stamina;
  if (updates.staminaUpdatedAt !== undefined) dbUpdates.stamina_updated_at = updates.staminaUpdatedAt;

  if (Object.keys(dbUpdates).length === 0) return;

  const { error } = await supabase
    .from("profiles")
    .update(dbUpdates)
    .eq("id", userId);

  if (error) throw error;
}

// ============ 피로도 계산 (Lazy Calculation) ============

/**
 * 현재 피로도를 계산합니다 (프론트엔드 표시용)
 * DB에 저장된 값 + 경과 시간 기반 회복량
 */
export function calculateCurrentStamina(
  storedStamina: number,
  updatedAt: string | Date,
  maxStamina: number,
  recoveryPerMinute: number = 1
): number {
  const elapsedMs = Date.now() - new Date(updatedAt).getTime();
  const elapsedMinutes = elapsedMs / 60000;
  const recovered = Math.floor(elapsedMinutes * recoveryPerMinute);

  return Math.min(maxStamina, storedStamina + recovered);
}

/**
 * 프로필에서 현재 피로도 계산
 */
export function getCalculatedStamina(profile: {
  stamina: number;
  staminaUpdatedAt: string;
  maxStamina: number;
}): number {
  return calculateCurrentStamina(
    profile.stamina,
    profile.staminaUpdatedAt,
    profile.maxStamina
  );
}

// ============ 피로도 소모 API (DB RPC - Lazy Calculation) ============

export interface ConsumeStaminaResult {
  success: boolean;
  remaining: number;
  consumed: number;
  max: number;
  message?: string;
}

export async function consumeStamina(
  userId: string,
  amount: number
): Promise<ConsumeStaminaResult> {
  const { data, error } = await supabase.rpc("consume_stamina", {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) throw error;

  // RPC returns JSON directly (not array)
  const result = data || { success: false, remaining: 0, consumed: 0, max: 100 };

  return {
    success: result.success,
    remaining: result.remaining ?? 0,
    consumed: result.consumed ?? amount,
    max: result.max ?? 100,
    message: result.message,
  };
}

// ============ 피로도 회복 API (DB RPC) ============

export async function restoreStamina(
  userId: string,
  amount: number
): Promise<number> {
  const { data, error } = await supabase.rpc("restore_stamina", {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) throw error;

  return data || 0;
}

// ============ 크리스탈 사용 API (DB RPC) ============

export async function useCrystal(
  userId: string,
  crystalTier: "basic" | "advanced" | "superior",
  charges: number
): Promise<number> {
  const { data, error } = await supabase.rpc("use_crystal", {
    p_user_id: userId,
    p_crystal_tier: crystalTier,
    p_charges: charges,
  });

  if (error) throw error;

  return data || 0;
}

// ============ 귓속말 충전 소모 API (DB RPC) ============

export interface ConsumeWhisperResult {
  success: boolean;
  remainingCharges: number;
  crystalTier: CrystalTier;
}

export async function consumeWhisperCharge(
  userId: string
): Promise<ConsumeWhisperResult> {
  const { data, error } = await supabase.rpc("consume_whisper_charge", {
    p_user_id: userId,
  });

  if (error) throw error;

  const result = data?.[0] || { success: false, remaining_charges: 0, crystal_tier: null };

  return {
    success: result.success,
    remainingCharges: result.remaining_charges,
    crystalTier: result.crystal_tier as CrystalTier,
  };
}
