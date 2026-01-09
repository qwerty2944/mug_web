/**
 * Trait API
 * 트레이트 데이터 로드 및 JSONB 조작
 */

import { supabase } from "@/shared/api/supabase";
import type { Trait, TraitSource } from "../types";

// ============ JSON 데이터 로드 ============

let traitsCache: Trait[] | null = null;

/**
 * 모든 트레이트 로드 (JSON 파일)
 */
export async function fetchTraits(): Promise<Trait[]> {
  if (traitsCache) return traitsCache;

  const res = await fetch("/data/traits/traits.json");
  if (!res.ok) throw new Error("Failed to load traits data");

  const data = await res.json();
  traitsCache = data.traits as Trait[];
  return traitsCache;
}

/**
 * 특정 트레이트 조회
 */
export async function fetchTraitById(traitId: string): Promise<Trait | null> {
  const traits = await fetchTraits();
  return traits.find((t) => t.id === traitId) ?? null;
}

// ============ JSONB 트레이트 타입 ============

export interface StoredTrait {
  id: string;
  source: TraitSource;
  acquiredAt: string;
  sourceDetail?: string;
}

// ============ JSONB 조작 ============

/**
 * 캐릭터의 트레이트 목록 조회 (profiles.traits JSONB)
 */
export async function fetchCharacterTraits(userId: string): Promise<StoredTrait[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("traits")
    .eq("id", userId)
    .single();

  if (error) throw error;

  // traits가 null이거나 없으면 빈 배열
  const traits = data?.traits;
  if (!traits || !Array.isArray(traits)) return [];

  return traits as StoredTrait[];
}

/**
 * 트레이트 부여 (JSONB 배열에 추가)
 */
export async function grantTrait(
  userId: string,
  traitId: string,
  source: TraitSource,
  sourceDetail?: string
): Promise<StoredTrait[]> {
  // 현재 트레이트 조회
  const currentTraits = await fetchCharacterTraits(userId);

  // 이미 있으면 스킵
  if (currentTraits.some((t) => t.id === traitId)) {
    return currentTraits;
  }

  // 새 트레이트 추가
  const newTrait: StoredTrait = {
    id: traitId,
    source,
    acquiredAt: new Date().toISOString(),
    sourceDetail,
  };

  const updatedTraits = [...currentTraits, newTrait];

  // DB 업데이트
  const { error } = await supabase
    .from("profiles")
    .update({ traits: updatedTraits })
    .eq("id", userId);

  if (error) throw error;

  return updatedTraits;
}

/**
 * 트레이트 제거
 */
export async function removeTrait(userId: string, traitId: string): Promise<StoredTrait[]> {
  const currentTraits = await fetchCharacterTraits(userId);
  const updatedTraits = currentTraits.filter((t) => t.id !== traitId);

  const { error } = await supabase
    .from("profiles")
    .update({ traits: updatedTraits })
    .eq("id", userId);

  if (error) throw error;

  return updatedTraits;
}

/**
 * 여러 트레이트 일괄 부여 (캐릭터 생성 시)
 */
export async function grantMultipleTraits(
  userId: string,
  traits: { traitId: string; source: TraitSource; sourceDetail?: string }[]
): Promise<StoredTrait[]> {
  const currentTraits = await fetchCharacterTraits(userId);
  const existingIds = new Set(currentTraits.map((t) => t.id));

  const newTraits: StoredTrait[] = traits
    .filter((t) => !existingIds.has(t.traitId))
    .map((t) => ({
      id: t.traitId,
      source: t.source,
      acquiredAt: new Date().toISOString(),
      sourceDetail: t.sourceDetail,
    }));

  const updatedTraits = [...currentTraits, ...newTraits];

  const { error } = await supabase
    .from("profiles")
    .update({ traits: updatedTraits })
    .eq("id", userId);

  if (error) throw error;

  return updatedTraits;
}

/**
 * 트레이트 전체 설정 (덮어쓰기)
 */
export async function setTraits(userId: string, traits: StoredTrait[]): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ traits })
    .eq("id", userId);

  if (error) throw error;
}
