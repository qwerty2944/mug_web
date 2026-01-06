import { useQuery } from "@tanstack/react-query";
import { fetchWeatherSettings } from "../api";

export const weatherSettingsKeys = {
  all: ["weather-settings"] as const,
  global: () => [...weatherSettingsKeys.all, "global"] as const,
};

/**
 * 날씨 설정 조회 훅
 */
export function useWeatherSettings() {
  return useQuery({
    queryKey: weatherSettingsKeys.global(),
    queryFn: fetchWeatherSettings,
    staleTime: Infinity, // 설정은 자주 변경되지 않음
  });
}
