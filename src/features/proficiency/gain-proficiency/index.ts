"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { increaseProficiency, proficiencyKeys } from "@/entities/proficiency";
import type { ProficiencyType } from "@/entities/proficiency";

interface GainProficiencyParams {
  type: ProficiencyType;
  amount?: number;
}

interface UseGainProficiencyOptions {
  onSuccess?: (newLevel: number) => void;
  onError?: (error: Error) => void;
}

/**
 * 숙련도 증가 mutation hook
 */
export function useGainProficiency(
  userId: string | undefined,
  options?: UseGainProficiencyOptions
) {
  const queryClient = useQueryClient();

  return useMutation<number, Error, GainProficiencyParams>({
    mutationFn: async ({ type, amount = 1 }) => {
      if (!userId) throw new Error("User ID is required");
      return increaseProficiency(userId, type, amount);
    },
    onSuccess: (newLevel) => {
      // 캐시 무효화
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: proficiencyKeys.detail(userId),
        });
      }
      options?.onSuccess?.(newLevel);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
  });
}
