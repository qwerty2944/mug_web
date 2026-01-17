/**
 * 상태이상 데이터 API
 * JSON 데이터 로드 함수
 */

import type { StatusDefinition, StatusCategory } from "../types";
import { supabase } from "@/shared/api/supabase";

// Supabase Storage URL
const STORAGE_BUCKET = "game-data";
const STATUS_PATH = "status";

interface StatusesResponse {
  version: string;
  generatedAt: string;
  totalCount: number;
  statistics: {
    buff: number;
    debuff: number;
    injury: number;
  };
  statuses: StatusDefinition[];
}

/**
 * Supabase Storage에서 JSON 로드 (fallback: public 폴더)
 */
async function loadStatusJson<T>(filename: string): Promise<T> {
  try {
    // Supabase Storage에서 시도
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(`${STATUS_PATH}/${filename}`);

    if (data && !error) {
      const text = await data.text();
      return JSON.parse(text);
    }
  } catch {
    console.warn(`[Status] Supabase 로드 실패, fallback 사용: ${filename}`);
  }

  // Fallback: public 폴더
  const response = await fetch(`/data/status/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}: ${response.status}`);
  }
  return response.json();
}

/**
 * 모든 상태이상 데이터 로드
 */
export async function fetchStatuses(): Promise<StatusDefinition[]> {
  const data = await loadStatusJson<StatusesResponse>("statuses.json");
  return data.statuses;
}

/**
 * 카테고리별 상태이상 로드
 */
export async function fetchStatusesByCategory(
  category: StatusCategory
): Promise<StatusDefinition[]> {
  const all = await fetchStatuses();
  return all.filter((s) => s.category === category);
}

/**
 * 단일 상태이상 로드
 */
export async function fetchStatusById(
  id: string
): Promise<StatusDefinition | null> {
  const all = await fetchStatuses();
  return all.find((s) => s.id === id) ?? null;
}

/**
 * 버프 목록 로드
 */
export async function fetchBuffs(): Promise<StatusDefinition[]> {
  return fetchStatusesByCategory("buff");
}

/**
 * 디버프 목록 로드
 */
export async function fetchDebuffs(): Promise<StatusDefinition[]> {
  return fetchStatusesByCategory("debuff");
}

/**
 * 부상 목록 로드
 */
export async function fetchInjuries(): Promise<StatusDefinition[]> {
  return fetchStatusesByCategory("injury");
}
