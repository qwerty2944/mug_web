"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useGameSettings } from "../queries";
import { calculateGameTime } from "./calculateLocalTime";
import type { GameTime, Period } from "../types";

interface UseRealtimeGameTimeReturn {
  gameTime: GameTime | null;
  isDay: boolean;
  isNight: boolean;
  isLoading: boolean;
}

/**
 * 실시간 게임 시간을 제공하는 훅
 *
 * - 1초마다 로컬에서 시간 계산
 * - 시간대 변경 시 이벤트 발생
 *
 * @example
 * const { gameTime, isDay, isNight } = useRealtimeGameTime();
 * if (isNight) {
 *   // 밤에만 표시할 UI
 * }
 */
export function useRealtimeGameTime(): UseRealtimeGameTimeReturn {
  const [gameTime, setGameTime] = useState<GameTime | null>(null);
  const lastPeriodRef = useRef<Period | null>(null);

  const { data: settings, isLoading } = useGameSettings();

  // 로컬 시간 계산 (1초마다)
  useEffect(() => {
    if (!settings) return;

    const updateTime = () => {
      const time = calculateGameTime({
        gameEpoch: settings.game_epoch,
        cycleHours: settings.day_cycle_hours,
      });

      setGameTime(time);

      // 시간대 변경 감지
      if (lastPeriodRef.current && lastPeriodRef.current !== time.period) {
        // 시간대 변경 이벤트 발생
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("game-period-change", {
              detail: { from: lastPeriodRef.current, to: time.period },
            })
          );
        }
      }
      lastPeriodRef.current = time.period;
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [settings]);

  return {
    gameTime,
    isDay: gameTime?.period === "day" || gameTime?.period === "dawn",
    isNight: gameTime?.period === "night" || gameTime?.period === "dusk",
    isLoading,
  };
}

/**
 * 시간대 변경 이벤트를 구독하는 훅
 *
 * @example
 * useOnPeriodChange((from, to) => {
 *   if (to === "night") {
 *     toast("밤이 되었습니다. 암흑 마법이 강해집니다!");
 *   }
 * });
 */
export function useOnPeriodChange(
  callback: (from: Period, to: Period) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = (event: Event) => {
      const { from, to } = (event as CustomEvent).detail;
      callbackRef.current(from, to);
    };

    window.addEventListener("game-period-change", handler);
    return () => window.removeEventListener("game-period-change", handler);
  }, []);
}
