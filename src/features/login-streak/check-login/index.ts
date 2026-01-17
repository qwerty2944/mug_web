"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkDailyLogin, profileKeys } from "@/entities/user";
import type { DailyLoginResult } from "@/entities/user";

/**
 * 일일 로그인 체크 훅
 * - 프로필 로드 후 1회 호출
 * - 새 날이면 isNewDay: true 반환
 */
export function useCheckDailyLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => checkDailyLogin(userId),
    onSuccess: (data: DailyLoginResult, userId: string) => {
      if (data.isNewDay) {
        // 프로필 쿼리 무효화하여 최신 streak 반영
        queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      }
    },
  });
}
