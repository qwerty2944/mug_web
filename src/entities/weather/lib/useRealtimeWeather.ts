"use client";

import { useEffect, useState, useRef } from "react";
import { useWeatherSettings } from "../queries";
import { calculateWeather } from "./calculateWeather";
import type { Weather, WeatherType } from "../types";

interface UseRealtimeWeatherReturn {
  weather: Weather | null;
  isLoading: boolean;
}

/**
 * 실시간 날씨를 제공하는 훅
 *
 * - 1초마다 로컬에서 날씨 계산
 * - 날씨 변경 시 이벤트 발생
 *
 * @example
 * const { weather } = useRealtimeWeather();
 * if (weather?.currentWeather === "rainy") {
 *   // 비 올 때만 표시할 UI
 * }
 */
export function useRealtimeWeather(): UseRealtimeWeatherReturn {
  const [weather, setWeather] = useState<Weather | null>(null);
  const lastWeatherRef = useRef<WeatherType | null>(null);

  const { data: settings, isLoading } = useWeatherSettings();

  // 로컬 날씨 계산 (1초마다)
  useEffect(() => {
    if (!settings) return;

    const updateWeather = () => {
      const w = calculateWeather({
        weather_epoch: settings.weather_epoch,
        weather_cycle_hours: settings.weather_cycle_hours,
      });

      setWeather(w);

      // 날씨 변경 감지
      if (lastWeatherRef.current && lastWeatherRef.current !== w.currentWeather) {
        // 날씨 변경 이벤트 발생
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("weather-change", {
              detail: { from: lastWeatherRef.current, to: w.currentWeather },
            })
          );
        }
      }
      lastWeatherRef.current = w.currentWeather;
    };

    updateWeather();
    const interval = setInterval(updateWeather, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  return {
    weather,
    isLoading,
  };
}

/**
 * 날씨 변경 이벤트를 구독하는 훅
 *
 * @example
 * useOnWeatherChange((from, to) => {
 *   if (to === "rainy") {
 *     toast("비가 내리기 시작합니다. 번개 마법이 강해집니다!");
 *   }
 * });
 */
export function useOnWeatherChange(
  callback: (from: WeatherType, to: WeatherType) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = (event: Event) => {
      const { from, to } = (event as CustomEvent).detail;
      callbackRef.current(from, to);
    };

    window.addEventListener("weather-change", handler);
    return () => window.removeEventListener("weather-change", handler);
  }, []);
}
