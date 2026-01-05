"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "../api";

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: signOut,
    onSuccess: () => {
      // 로그아웃 시 모든 캐시 초기화
      queryClient.clear();
    },
  });
}
