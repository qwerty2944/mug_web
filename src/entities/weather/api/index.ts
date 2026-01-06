import { supabase } from "@/shared/api";
import type { WeatherSettings } from "../types";

/**
 * 날씨 설정을 조회합니다.
 * game_settings 테이블에서 날씨 관련 컬럼만 추출합니다.
 */
export async function fetchWeatherSettings(): Promise<WeatherSettings | null> {
  const { data, error } = await supabase
    .from("game_settings")
    .select("weather_cycle_hours, weather_epoch, current_weather")
    .eq("id", "global")
    .single();

  if (error) {
    console.error("[WeatherSettings] Fetch error:", error);
    return null;
  }

  return data as WeatherSettings;
}
