"use client";

import { useState } from "react";
import { useThemeStore } from "@/application/stores";
import { useRealtimeWeather } from "../lib/useRealtimeWeather";
import { formatWeatherTimeRemaining } from "../lib/calculateWeather";
import { getActiveWeatherBuffs } from "../lib/weatherEffects";
import { WEATHER_INFO } from "../types";

interface WeatherDisplayProps {
  compact?: boolean;
}

/**
 * 날씨 표시 컴포넌트
 *
 * @example
 * <WeatherDisplay /> // 기본 표시
 * <WeatherDisplay compact /> // 컴팩트 모드 (호버시 버프 오버레이)
 */
export function WeatherDisplay({ compact = false }: WeatherDisplayProps) {
  const { theme } = useThemeStore();
  const { weather, isLoading } = useRealtimeWeather();
  const [showOverlay, setShowOverlay] = useState(false);

  if (isLoading || !weather) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1 rounded font-mono text-sm"
        style={{
          background: theme.colors.bgDark,
          color: theme.colors.textMuted,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <span>⏳</span>
        <span>--</span>
      </div>
    );
  }

  const weatherInfo = WEATHER_INFO[weather.currentWeather];
  const activeBuffs = getActiveWeatherBuffs(weather.currentWeather);
  const nextWeatherStr = formatWeatherTimeRemaining(weather.nextWeatherIn);

  if (compact) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
      >
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs cursor-help"
          style={{
            background: theme.colors.bgDark,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <span>{weatherInfo.icon}</span>
          <span>{weatherInfo.nameKo}</span>
          {activeBuffs.length > 0 && (
            <span style={{ color: theme.colors.primary }}>⬆</span>
          )}
        </div>

        {/* 버프 오버레이 */}
        {showOverlay && (
          <div
            className="absolute top-full left-0 mt-1 p-2 rounded shadow-lg z-50 min-w-48"
            style={{
              background: theme.colors.bgLight,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            {/* 날씨 정보 */}
            <div
              className="flex items-center gap-2 mb-2 pb-2 border-b"
              style={{ borderColor: theme.colors.border }}
            >
              <span className="text-lg">{weatherInfo.icon}</span>
              <div>
                <div
                  className="text-sm font-mono font-bold"
                  style={{ color: theme.colors.text }}
                >
                  {weatherInfo.nameKo}
                </div>
                <div
                  className="text-xs font-mono"
                  style={{ color: theme.colors.textMuted }}
                >
                  다음 날씨까지 {nextWeatherStr}
                </div>
              </div>
            </div>

            {/* 활성 버프 */}
            {activeBuffs.length > 0 ? (
              <div className="space-y-1">
                <div
                  className="text-xs font-mono"
                  style={{ color: theme.colors.textMuted }}
                >
                  날씨 효과
                </div>
                {activeBuffs.map((buff) => {
                  const isPositive = buff.effect.modifier >= 1;
                  const percent = Math.round((buff.effect.modifier - 1) * 100);
                  const sign = percent >= 0 ? "+" : "";
                  return (
                    <div
                      key={buff.id}
                      className="flex items-center gap-2 text-xs font-mono"
                    >
                      <span>{buff.icon}</span>
                      <span
                        style={{
                          color: isPositive
                            ? theme.colors.success
                            : theme.colors.error,
                        }}
                      >
                        {buff.nameKo}
                      </span>
                      <span style={{ color: theme.colors.textMuted }}>
                        {sign}
                        {percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="text-xs font-mono"
                style={{ color: theme.colors.textMuted }}
              >
                날씨 효과 없음
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 비-컴팩트 모드
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded font-mono text-sm"
      style={{
        background: theme.colors.bgDark,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <span className="text-base">{weatherInfo.icon}</span>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold">{weatherInfo.nameKo}</span>
        </div>
        {activeBuffs.length > 0 && (
          <div
            className="text-xs flex items-center gap-1"
            style={{ color: theme.colors.primary }}
          >
            <span>⬆</span>
            <span>
              {activeBuffs
                .map((b) => {
                  const percent = Math.round((b.effect.modifier - 1) * 100);
                  const sign = percent >= 0 ? "+" : "";
                  return `${b.effect.target} ${sign}${percent}%`;
                })
                .join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
