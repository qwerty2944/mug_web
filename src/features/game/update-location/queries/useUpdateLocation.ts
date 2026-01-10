"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLocation } from "../api";
import { consumeFatigue, profileKeys, FATIGUE_COST } from "@/entities/user";
import toast from "react-hot-toast";

interface UpdateLocationParams {
  userId: string;
  characterName: string;
  mapId: string;
}

interface UseUpdateLocationOptions {
  onInsufficientFatigue?: () => void;
  skipFatigueCheck?: boolean;
}

export function useUpdateLocation(options: UseUpdateLocationOptions = {}) {
  const { onInsufficientFatigue, skipFatigueCheck = false } = options;
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateLocationParams>({
    mutationFn: async (params) => {
      // 피로도 소모 (스킵 옵션이 없는 경우)
      if (!skipFatigueCheck) {
        const result = await consumeFatigue(params.userId, FATIGUE_COST.MAP_MOVE);
        if (!result.success) {
          toast.error(result.message || "피로도가 부족합니다");
          onInsufficientFatigue?.();
          throw new Error(result.message || "피로도 부족");
        }
      }

      // 위치 업데이트
      await updateLocation(params);
    },
    onSuccess: (_, params) => {
      // 프로필 캐시 무효화 (피로도 변경)
      queryClient.invalidateQueries({
        queryKey: profileKeys.detail(params.userId),
      });
    },
  });
}
