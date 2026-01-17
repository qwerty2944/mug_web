/**
 * 상태이상 React Query 훅
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchStatuses,
  fetchStatusesByCategory,
  fetchStatusById,
  fetchBuffs,
  fetchDebuffs,
  fetchInjuries,
} from "../api";
import type { StatusCategory } from "../types";
import { STALE_TIME } from "@/shared/config";

/** 쿼리 키 */
export const statusKeys = {
  all: ["statuses"] as const,
  lists: () => [...statusKeys.all, "list"] as const,
  list: (category?: StatusCategory) =>
    category
      ? ([...statusKeys.lists(), category] as const)
      : ([...statusKeys.lists()] as const),
  detail: (id: string) => [...statusKeys.all, "detail", id] as const,
  buffs: () => [...statusKeys.all, "buffs"] as const,
  debuffs: () => [...statusKeys.all, "debuffs"] as const,
  injuries: () => [...statusKeys.all, "injuries"] as const,
};

/**
 * 모든 상태이상 조회 훅
 */
export function useStatuses() {
  return useQuery({
    queryKey: statusKeys.lists(),
    queryFn: fetchStatuses,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * 카테고리별 상태이상 조회 훅
 */
export function useStatusesByCategory(category: StatusCategory) {
  return useQuery({
    queryKey: statusKeys.list(category),
    queryFn: () => fetchStatusesByCategory(category),
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * 단일 상태이상 조회 훅
 */
export function useStatus(id: string | undefined) {
  return useQuery({
    queryKey: statusKeys.detail(id ?? ""),
    queryFn: () => fetchStatusById(id!),
    enabled: !!id,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * 버프 목록 조회 훅
 */
export function useBuffs() {
  return useQuery({
    queryKey: statusKeys.buffs(),
    queryFn: fetchBuffs,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * 디버프 목록 조회 훅
 */
export function useDebuffs() {
  return useQuery({
    queryKey: statusKeys.debuffs(),
    queryFn: fetchDebuffs,
    staleTime: STALE_TIME.STATIC,
  });
}

/**
 * 부상 목록 조회 훅
 */
export function useInjuryDefinitions() {
  return useQuery({
    queryKey: statusKeys.injuries(),
    queryFn: fetchInjuries,
    staleTime: STALE_TIME.STATIC,
  });
}
