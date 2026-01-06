import type { Weather, WeatherSettings, WeatherType } from "../types";
import { WEATHER_ORDER } from "../types";

interface CalculateWeatherSettings {
  weather_epoch: string; // ISO string
  weather_cycle_hours: number; // 1 = 1 real hour per cycle
}

/**
 * 클라이언트에서 현재 날씨를 계산합니다.
 *
 * 1시간 사이클에서 12분씩 균등 5등분:
 * - 00:00-00:12 = sunny ☀️
 * - 00:12-00:24 = cloudy ☁️
 * - 00:24-00:36 = rainy 🌧️
 * - 00:36-00:48 = stormy ⛈️
 * - 00:48-01:00 = foggy 🌫️
 */
export function calculateWeather(settings: CalculateWeatherSettings): Weather {
  const now = Date.now();
  const epoch = new Date(settings.weather_epoch).getTime();
  const cycleMs = settings.weather_cycle_hours * 60 * 60 * 1000;

  const elapsed = now - epoch;
  const cyclePosition = ((elapsed % cycleMs) + cycleMs) % cycleMs;
  const cycleProgress = (cyclePosition / cycleMs) * 100;

  // 5등분: 0-20%, 20-40%, 40-60%, 60-80%, 80-100%
  const weatherIndex = Math.floor(cycleProgress / 20);
  const currentWeather = WEATHER_ORDER[weatherIndex % 5];

  // 진행률 계산 (현재 날씨 내에서)
  const segmentMs = cycleMs / 5; // 12분
  const segmentPosition = cyclePosition % segmentMs;
  const weatherProgress = Math.floor((segmentPosition / segmentMs) * 100);
  const nextWeatherIn = segmentMs - segmentPosition;

  return {
    currentWeather,
    weatherProgress,
    nextWeatherIn,
    cycleHours: settings.weather_cycle_hours,
  };
}

/**
 * 사이클 진행률(0-100%)로부터 날씨를 판정합니다.
 */
export function getWeatherFromProgress(progress: number): WeatherType {
  const segment = progress / 20;
  if (segment < 1) return "sunny";
  if (segment < 2) return "cloudy";
  if (segment < 3) return "rainy";
  if (segment < 4) return "stormy";
  return "foggy";
}

/**
 * 남은 시간(ms)을 "MM분 SS초" 형식으로 변환합니다.
 */
export function formatWeatherTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}분 ${seconds}초`;
  }
  return `${seconds}초`;
}
