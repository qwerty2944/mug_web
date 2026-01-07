"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { consumeStamina as consumeStaminaApi } from "@/entities/user";
import { profileKeys } from "@/entities/user";
import toast from "react-hot-toast";

interface UseConsumeStaminaOptions {
  onSuccess?: (remaining: number, max: number) => void;
  onInsufficientStamina?: () => void;
  showToast?: boolean;
}

/**
 * 피로도 소모 훅
 * - DB RPC consume_stamina 호출 (Lazy Calculation)
 * - 자동 시간 회복이 서버에서 계산됨
 * - 부족 시 에러 처리
 */
export function useConsumeStamina(
  userId: string | undefined,
  options: UseConsumeStaminaOptions = {}
) {
  const { onSuccess, onInsufficientStamina, showToast = true } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!userId) throw new Error("User ID is required");
      return consumeStaminaApi(userId, amount);
    },
    onSuccess: (result) => {
      if (result.success) {
        // 프로필 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: profileKeys.detail(userId!),
        });
        onSuccess?.(result.remaining, result.max);
      } else {
        // 피로도 부족
        if (showToast) {
          toast.error(result.message || "피로도가 부족합니다");
        }
        onInsufficientStamina?.();
      }
    },
    onError: (error) => {
      console.error("Failed to consume stamina:", error);
      if (showToast) {
        toast.error("피로도 처리 중 오류가 발생했습니다");
      }
    },
  });
}

/**
 * 피로도 체크 후 행동 실행 유틸리티
 */
export async function checkAndConsumeStamina(
  userId: string,
  amount: number
): Promise<{ success: boolean; remaining: number; message?: string }> {
  try {
    const result = await consumeStaminaApi(userId, amount);
    return {
      success: result.success,
      remaining: result.remaining,
      message: result.message,
    };
  } catch (error) {
    console.error("Stamina check failed:", error);
    return {
      success: false,
      remaining: 0,
      message: "피로도 확인 중 오류가 발생했습니다",
    };
  }
}
