import { useQuery } from "@tanstack/react-query";
import { fetchGameSettings } from "../api";

export const gameSettingsKeys = {
  all: ["game-settings"] as const,
  global: () => [...gameSettingsKeys.all, "global"] as const,
};

/**
 * 게임 설정 조회 훅
 */
export function useGameSettings() {
  return useQuery({
    queryKey: gameSettingsKeys.global(),
    queryFn: fetchGameSettings,
    staleTime: Infinity, // 설정은 자주 변경되지 않음
  });
}
