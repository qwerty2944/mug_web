/**
 * Trait React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTraits,
  fetchTraitById,
  fetchCharacterTraits,
  grantTrait,
  removeTrait,
  grantMultipleTraits,
} from "../api";
import type { Trait, TraitCategory, TraitSource } from "../types";
import type { StoredTrait } from "../api";

// ============ Query Keys ============

export const traitKeys = {
  all: ["traits"] as const,
  list: () => [...traitKeys.all, "list"] as const,
  detail: (id: string) => [...traitKeys.all, "detail", id] as const,
  byCategory: (category: TraitCategory) => [...traitKeys.all, "category", category] as const,
  character: (userId: string) => [...traitKeys.all, "character", userId] as const,
};

// ============ 트레이트 데이터 조회 ============

/**
 * 모든 트레이트 조회
 */
export function useTraits() {
  return useQuery({
    queryKey: traitKeys.list(),
    queryFn: fetchTraits,
    staleTime: Infinity, // JSON 데이터는 변하지 않음
  });
}

/**
 * 특정 트레이트 조회
 */
export function useTrait(traitId: string | undefined) {
  return useQuery({
    queryKey: traitKeys.detail(traitId || ""),
    queryFn: () => fetchTraitById(traitId!),
    enabled: !!traitId,
    staleTime: Infinity,
  });
}

/**
 * 카테고리별 트레이트 조회
 */
export function useTraitsByCategory(category: TraitCategory) {
  const { data: allTraits, ...rest } = useTraits();

  const filteredTraits = allTraits?.filter((t) => t.category === category) ?? [];

  return {
    data: filteredTraits,
    ...rest,
  };
}

/**
 * 숨겨지지 않은 트레이트만 조회
 */
export function useVisibleTraits() {
  const { data: allTraits, ...rest } = useTraits();

  const visibleTraits = allTraits?.filter((t) => !t.hidden) ?? [];

  return {
    data: visibleTraits,
    ...rest,
  };
}

// ============ 캐릭터 트레이트 조회 ============

/**
 * 캐릭터의 트레이트 목록 조회
 */
export function useCharacterTraits(userId: string | undefined) {
  return useQuery({
    queryKey: traitKeys.character(userId || ""),
    queryFn: () => fetchCharacterTraits(userId!),
    enabled: !!userId,
  });
}

/**
 * 캐릭터 트레이트 + 상세 정보 조회
 */
export function useCharacterTraitsWithDetails(userId: string | undefined) {
  const { data: characterTraits, isLoading: isLoadingCharacter } = useCharacterTraits(userId);
  const { data: allTraits, isLoading: isLoadingTraits } = useTraits();

  const traitsWithDetails = characterTraits?.map((ct) => {
    const traitData = allTraits?.find((t) => t.id === ct.id);
    return {
      ...ct,
      trait: traitData,
    };
  }).filter((ct) => ct.trait) ?? [];

  return {
    data: traitsWithDetails,
    isLoading: isLoadingCharacter || isLoadingTraits,
  };
}

// ============ 트레이트 부여/제거 ============

/**
 * 트레이트 부여 mutation
 */
export function useGrantTrait() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      traitId,
      source,
      sourceDetail,
    }: {
      userId: string;
      traitId: string;
      source: TraitSource;
      sourceDetail?: string;
    }) => grantTrait(userId, traitId, source, sourceDetail),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: traitKeys.character(variables.userId),
      });
    },
  });
}

/**
 * 트레이트 제거 mutation
 */
export function useRemoveTrait() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, traitId }: { userId: string; traitId: string }) =>
      removeTrait(userId, traitId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: traitKeys.character(variables.userId),
      });
    },
  });
}

/**
 * 여러 트레이트 일괄 부여 mutation (캐릭터 생성 시)
 */
export function useGrantMultipleTraits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      traits,
    }: {
      userId: string;
      traits: { traitId: string; source: TraitSource; sourceDetail?: string }[];
    }) => grantMultipleTraits(userId, traits),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: traitKeys.character(variables.userId),
      });
    },
  });
}
