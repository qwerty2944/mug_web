"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { consumeFatigue as consumeFatigueApi } from "@/entities/user";
import { profileKeys } from "@/entities/user";
import toast from "react-hot-toast";

interface UseConsumeFatigueOptions {
  onSuccess?: (remaining: number, max: number) => void;
  onInsufficientFatigue?: () => void;
  showToast?: boolean;
}

/**
 * 피로도 소모 훅
 * - DB RPC consume_fatigue 호출 (Lazy Calculation)
 * - 자동 시간 회복이 서버에서 계산됨
 * - 부족 시 에러 처리
 */
export function useConsumeFatigue(
  userId: string | undefined,
  options: UseConsumeFatigueOptions = {}
) {
  const { onSuccess, onInsufficientFatigue, showToast = true } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!userId) throw new Error("User ID is required");
      return consumeFatigueApi(userId, amount);
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
        onInsufficientFatigue?.();
      }
    },
    onError: (error) => {
      console.error("Failed to consume fatigue:", error);
      if (showToast) {
        toast.error("피로도 처리 중 오류가 발생했습니다");
      }
    },
  });
}

/**
 * 피로도 체크 후 행동 실행 유틸리티
 */
export async function checkAndConsumeFatigue(
  userId: string,
  amount: number
): Promise<{ success: boolean; remaining: number; message?: string }> {
  try {
    const result = await consumeFatigueApi(userId, amount);
    return {
      success: result.success,
      remaining: result.remaining,
      message: result.message,
    };
  } catch (error) {
    console.error("Fatigue check failed:", error);
    return {
      success: false,
      remaining: 0,
      message: "피로도 확인 중 오류가 발생했습니다",
    };
  }
}
