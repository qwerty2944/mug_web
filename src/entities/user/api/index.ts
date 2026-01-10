import { supabase } from "@/shared/api";
import type { UserProfile, CrystalTier, ReligionData } from "../types";
import type { CharacterInjury } from "@/entities/injury";
import { filterNaturallyHealedInjuries } from "@/entities/injury";

// ============ 프로필 조회 API ============

export async function fetchProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  // 부상 데이터 파싱 및 자연 치유 체크
  let injuries: CharacterInjury[] = data.injuries || [];
  if (injuries.length > 0) {
    const { remaining, healed } = filterNaturallyHealedInjuries(injuries);

    // 자연 치유된 부상이 있으면 DB 업데이트
    if (healed.length > 0) {
      await supabase
        .from("characters")
        .update({ injuries: remaining })
        .eq("user_id", userId);
      injuries = remaining;
    }
  }

  return {
    id: data.id,
    userId: data.user_id,
    nickname: data.nickname,
    level: data.level || 1,
    experience: data.experience || 0,
    gold: data.gold || 0,
    gems: data.gems || 0,
    fatigue: data.fatigue || 100,
    maxFatigue: data.max_fatigue || 100,
    fatigueUpdatedAt: data.fatigue_updated_at || new Date().toISOString(),
    isPremium: data.is_premium || false,
    premiumUntil: data.premium_until,
    character: data.character || null,
    appearance: data.appearance || null,
    buffs: data.buffs || [],
    currentMapId: data.current_map_id || "town_square",
    whisperCharges: data.whisper_charges || 0,
    crystalTier: (data.crystal_tier as CrystalTier) || null,
    currentHp: data.current_hp ?? null,
    currentMp: data.current_mp ?? null,
    injuries,
    religion: data.religion as ReligionData | null,
  };
}

// ============ 위치 업데이트 API ============

export async function updateCurrentMap(userId: string, mapId: string): Promise<void> {
  const { error } = await supabase
    .from("characters")
    .update({ current_map_id: mapId })
    .eq("user_id", userId);

  if (error) throw error;
}

// ============ 프로필 업데이트 API ============

export interface UpdateProfileParams {
  userId: string;
  level?: number;
  experience?: number;
  gold?: number;
  fatigue?: number;
  fatigueUpdatedAt?: string;
  currentHp?: number | null;
  currentMp?: number | null;
}

export async function updateProfile(params: UpdateProfileParams): Promise<void> {
  const { userId, ...updates } = params;

  // snake_case 변환
  const dbUpdates: Record<string, unknown> = {};
  if (updates.level !== undefined) dbUpdates.level = updates.level;
  if (updates.experience !== undefined) dbUpdates.experience = updates.experience;
  if (updates.gold !== undefined) dbUpdates.gold = updates.gold;
  if (updates.fatigue !== undefined) dbUpdates.fatigue = updates.fatigue;
  if (updates.fatigueUpdatedAt !== undefined) dbUpdates.fatigue_updated_at = updates.fatigueUpdatedAt;
  if (updates.currentHp !== undefined) dbUpdates.current_hp = updates.currentHp;
  if (updates.currentMp !== undefined) dbUpdates.current_mp = updates.currentMp;

  if (Object.keys(dbUpdates).length === 0) return;

  const { error } = await supabase
    .from("characters")
    .update(dbUpdates)
    .eq("user_id", userId);

  if (error) throw error;
}

// ============ 피로도 계산 (Lazy Calculation) ============

/**
 * 현재 피로도를 계산합니다 (프론트엔드 표시용)
 * DB에 저장된 값 + 경과 시간 기반 회복량
 */
export function calculateCurrentFatigue(
  storedFatigue: number,
  updatedAt: string | Date,
  maxFatigue: number,
  recoveryPerMinute: number = 1
): number {
  const elapsedMs = Date.now() - new Date(updatedAt).getTime();
  const elapsedMinutes = elapsedMs / 60000;
  const recovered = Math.floor(elapsedMinutes * recoveryPerMinute);

  return Math.min(maxFatigue, storedFatigue + recovered);
}

/**
 * 프로필에서 현재 피로도 계산
 */
export function getCalculatedFatigue(profile: {
  fatigue: number;
  fatigueUpdatedAt: string;
  maxFatigue: number;
}): number {
  return calculateCurrentFatigue(
    profile.fatigue,
    profile.fatigueUpdatedAt,
    profile.maxFatigue
  );
}

// ============ 피로도 소모 API (DB RPC - Lazy Calculation) ============

export interface ConsumeFatigueResult {
  success: boolean;
  remaining: number;
  consumed: number;
  max: number;
  message?: string;
}

export async function consumeFatigue(
  userId: string,
  amount: number
): Promise<ConsumeFatigueResult> {
  const { data, error } = await supabase.rpc("consume_fatigue", {
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

export async function restoreFatigue(
  userId: string,
  amount: number
): Promise<number> {
  const { data, error } = await supabase.rpc("restore_fatigue", {
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

// ============ 귀환 위치 결정 API ============

interface Religion {
  id: string;
  altarMapId: string;
}

let religionsCache: Religion[] | null = null;

async function fetchReligions(): Promise<Religion[]> {
  if (religionsCache) return religionsCache;

  const response = await fetch("/data/religions/religions.json");
  const data = await response.json();
  religionsCache = data.religions;
  return religionsCache!;
}

/**
 * 사망 시 귀환 위치 결정
 * - 종교가 있으면 해당 종교의 제단 위치
 * - 종교가 없으면 starting_village
 */
export async function getRespawnLocation(religionId: string | null): Promise<string> {
  if (!religionId) return "starting_village";

  const religions = await fetchReligions();
  const religion = religions.find((r) => r.id === religionId);

  return religion?.altarMapId || "starting_village";
}

// ============ 패배 후 프로필 업데이트 API ============

export interface DefeatUpdateParams {
  userId: string;
  currentHp: number;
  currentMp: number;
  currentMapId: string;
  newInjury: CharacterInjury | null;
}

/**
 * 패배 후 프로필 업데이트
 * - HP를 1로 설정
 * - 귀환 위치로 이동
 * - 부상 추가
 */
export async function updateProfileAfterDefeat(params: DefeatUpdateParams): Promise<void> {
  const { userId, currentHp, currentMp, currentMapId, newInjury } = params;

  // 부상이 있으면 DB에 추가 (RPC 사용)
  if (newInjury) {
    const { error: injuryError } = await supabase.rpc("add_injury", {
      p_user_id: userId,
      p_injury: newInjury,
    });
    if (injuryError) throw injuryError;
  }

  // 나머지 필드 업데이트
  const { error } = await supabase
    .from("characters")
    .update({
      current_hp: currentHp,
      current_mp: currentMp,
      current_map_id: currentMapId,
    })
    .eq("user_id", userId);

  if (error) throw error;
}

// ============ 골드로 부상 치료 API ============

export interface HealInjuryWithGoldResult {
  success: boolean;
  remainingGold: number;
  removedInjury: CharacterInjury | null;
}

export async function healInjuryWithGold(
  userId: string,
  injuryIndex: number,
  goldCost: number
): Promise<HealInjuryWithGoldResult> {
  const { data, error } = await supabase.rpc("heal_injury_with_gold", {
    p_user_id: userId,
    p_injury_index: injuryIndex,
    p_gold_cost: goldCost,
  });

  if (error) throw error;

  return {
    success: data?.success ?? false,
    remainingGold: data?.remaining_gold ?? 0,
    removedInjury: data?.removed_injury ?? null,
  };
}
