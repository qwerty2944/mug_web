import { supabase } from "@/shared/api/supabase";
import type { MagicElement } from "@/entities/proficiency";
import type { Spell, SpellsData, SpellProficiency } from "../types";

// ============ JSON 데이터 로드 ============

/**
 * 모든 주문 데이터 로드
 */
export async function fetchSpells(): Promise<Spell[]> {
  const response = await fetch("/data/combat/spells.json");
  if (!response.ok) {
    throw new Error("Failed to fetch spells data");
  }
  const data: SpellsData = await response.json();
  return data.spells;
}

/**
 * 특정 ID의 주문 조회
 */
export async function fetchSpellById(spellId: string): Promise<Spell | null> {
  const spells = await fetchSpells();
  return spells.find((s) => s.id === spellId) ?? null;
}

/**
 * 속성별 주문 조회
 */
export async function fetchSpellsByElement(element: MagicElement): Promise<Spell[]> {
  const spells = await fetchSpells();
  return spells.filter((s) => s.element === element);
}

/**
 * 치유 주문만 조회
 */
export async function fetchHealingSpells(): Promise<Spell[]> {
  const spells = await fetchSpells();
  return spells.filter((s) => s.type === "heal");
}

/**
 * 공격 주문만 조회 (attack + dot)
 */
export async function fetchAttackSpells(): Promise<Spell[]> {
  const spells = await fetchSpells();
  return spells.filter((s) => s.type === "attack" || s.type === "dot");
}

// ============ 주문 숙련도 API (Supabase) ============

/**
 * 유저의 모든 주문 숙련도 조회
 */
export async function fetchSpellProficiencies(
  userId: string
): Promise<SpellProficiency[]> {
  const { data, error } = await supabase
    .rpc("get_spell_proficiencies", { p_user_id: userId });

  if (error) {
    console.error("Failed to fetch spell proficiencies:", error);
    return [];
  }

  return (data ?? []).map((row: {
    spell_id: string;
    experience: number;
    cast_count: number;
    last_cast_at: string | null;
  }) => ({
    userId,
    spellId: row.spell_id,
    experience: row.experience,
    castCount: row.cast_count,
    lastCastAt: row.last_cast_at,
  }));
}

/**
 * 특정 주문의 숙련도 조회
 */
export async function fetchSpellProficiency(
  userId: string,
  spellId: string
): Promise<SpellProficiency | null> {
  const { data, error } = await supabase
    .from("spell_proficiency")
    .select("*")
    .eq("user_id", userId)
    .eq("spell_id", spellId)
    .single();

  if (error || !data) {
    // 숙련도 없으면 기본값 반환
    return {
      userId,
      spellId,
      experience: 0,
      castCount: 0,
      lastCastAt: null,
    };
  }

  return {
    userId,
    spellId: data.spell_id,
    experience: data.experience,
    castCount: data.cast_count,
    lastCastAt: data.last_cast_at,
  };
}

/**
 * 주문 숙련도 증가 (RPC 호출)
 */
export async function increaseSpellProficiency(
  userId: string,
  spellId: string,
  amount: number = 1
): Promise<{ newExperience: number; newCastCount: number } | null> {
  const { data, error } = await supabase
    .rpc("increase_spell_proficiency", {
      p_user_id: userId,
      p_spell_id: spellId,
      p_amount: amount,
    });

  if (error) {
    console.error("Failed to increase spell proficiency:", error);
    return null;
  }

  // RPC는 단일 행 반환
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    newExperience: row.new_experience,
    newCastCount: row.new_cast_count,
  };
}
