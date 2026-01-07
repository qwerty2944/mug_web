"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchKarma, updateKarma } from "../api";
import { profileKeys } from "@/entities/user";

// ============ Query Keys ============

export const karmaKeys = {
  all: ["karma"] as const,
  detail: (userId: string) => [...karmaKeys.all, userId] as const,
};

// ============ Queries ============

/**
 * 카르마 조회 훅
 */
export function useKarma(userId: string | undefined) {
  return useQuery({
    queryKey: karmaKeys.detail(userId || ""),
    queryFn: () => fetchKarma(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30초
  });
}

// ============ Mutations ============

export interface UseUpdateKarmaOptions {
  onSuccess?: (newKarma: number) => void;
  onError?: (error: Error) => void;
}

/**
 * 카르마 업데이트 훅
 */
export function useUpdateKarma(
  userId: string | undefined,
  options?: UseUpdateKarmaOptions
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      change,
      reason,
    }: {
      change: number;
      reason?: string;
    }) => {
      if (!userId) throw new Error("User ID is required");
      return updateKarma(userId, change, reason);
    },
    onSuccess: (result) => {
      // 카르마 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: karmaKeys.detail(userId || ""),
      });
      // 프로필 캐시도 무효화 (karma 필드가 포함되어 있을 수 있음)
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(userId || ""),
      });
      options?.onSuccess?.(result.newKarma);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
}
