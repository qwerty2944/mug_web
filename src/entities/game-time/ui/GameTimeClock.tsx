"use client";

import { useState } from "react";
import { useThemeStore } from "@/application/stores";
import { useRealtimeGameTime } from "../lib/useRealtimeGameTime";
import { formatGameTime, formatTimeRemaining } from "../lib/calculateLocalTime";
import { getActiveTimeBuffs, getElementBuffInfo } from "../lib/timeBuffs";
import { PERIOD_INFO } from "../types";

interface GameTimeClockProps {
  showBuffInfo?: boolean;
  compact?: boolean;
}

/**
 * 게임 시간 표시 컴포넌트
 *
 * @example
 * <GameTimeClock /> // 기본 표시
 * <GameTimeClock showBuffInfo /> // 버프 정보 포함
 * <GameTimeClock compact /> // 컴팩트 모드 (호버시 버프 오버레이)
 */
export function GameTimeClock({
  showBuffInfo = false,
  compact = false,
}: GameTimeClockProps) {
  const { theme } = useThemeStore();
  const { gameTime, isLoading } = useRealtimeGameTime();
  const [showOverlay, setShowOverlay] = useState(false);

  if (isLoading || !gameTime) {
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
        <span>--:--</span>
      </div>
    );
  }

  const periodInfo = PERIOD_INFO[gameTime.period];
  const timeStr = formatGameTime(gameTime);
  const activeBuffs = getActiveTimeBuffs(gameTime.period);
  const buffInfo = showBuffInfo ? getElementBuffInfo(gameTime.period) : null;
  const nextPeriodStr = formatTimeRemaining(gameTime.nextPeriodIn);

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
          <span>{periodInfo.icon}</span>
          <span>{timeStr}</span>
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
            {/* 시간대 정보 */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b" style={{ borderColor: theme.colors.border }}>
              <span className="text-lg">{periodInfo.icon}</span>
              <div>
                <div className="text-sm font-mono font-bold" style={{ color: theme.colors.text }}>
                  {periodInfo.nameKo}
                </div>
                <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                  다음 시간대까지 {nextPeriodStr}
                </div>
              </div>
            </div>

            {/* 활성 버프 */}
            {activeBuffs.length > 0 ? (
              <div className="space-y-1">
                <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                  활성 버프
                </div>
                {activeBuffs.map((buff) => (
                  <div
                    key={buff.id}
                    className="flex items-center gap-2 text-xs font-mono"
                  >
                    <span>{buff.icon}</span>
                    <span style={{ color: theme.colors.primary }}>{buff.nameKo}</span>
                    <span style={{ color: theme.colors.textMuted }}>
                      {buff.description}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                활성 버프 없음
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded font-mono text-sm"
      style={{
        background: theme.colors.bgDark,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <span className="text-base">{periodInfo.icon}</span>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold">{timeStr}</span>
          <span
            className="text-xs"
            style={{ color: theme.colors.textMuted }}
          >
            ({periodInfo.nameKo})
          </span>
        </div>
        {buffInfo && (
          <div
            className="text-xs flex items-center gap-1"
            style={{ color: theme.colors.primary }}
          >
            <span>⬆</span>
            <span>
              {buffInfo.element === "dark" ? "암흑" : "신성"} +{buffInfo.bonus}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 시간대 진행률 바
 */
export function PeriodProgressBar() {
  const { theme } = useThemeStore();
  const { gameTime } = useRealtimeGameTime();

  if (!gameTime) return null;

  const periodInfo = PERIOD_INFO[gameTime.period];
  const nextPeriodIn = formatTimeRemaining(gameTime.nextPeriodIn);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: theme.colors.textMuted }}>
          {periodInfo.icon} {periodInfo.nameKo}
        </span>
        <span style={{ color: theme.colors.textDim }}>
          다음 시간대까지 {nextPeriodIn}
        </span>
      </div>
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: theme.colors.bgLight }}
      >
        <div
          className="h-full transition-all duration-1000"
          style={{
            width: `${gameTime.periodProgress}%`,
            background: theme.colors.primary,
          }}
        />
      </div>
    </div>
  );
}
