"use client";

import { useState, useEffect, useCallback } from "react";
import { useThemeStore } from "@/shared/config";
import type { DuelRequest } from "@/application/stores";

interface DuelRequestModalProps {
  request: DuelRequest;
  onAccept: () => void;
  onDecline: () => void;
}

export function DuelRequestModal({
  request,
  onAccept,
  onDecline,
}: DuelRequestModalProps) {
  const { theme } = useThemeStore();
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // 남은 시간 계산
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((request.expiresAt - now) / 1000));
      setRemainingTime(remaining);

      // 시간 초과시 자동 거절
      if (remaining <= 0) {
        onDecline();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [request.expiresAt, onDecline]);

  // 남은 시간 바 색상
  const getTimeBarColor = () => {
    if (remainingTime <= 5) return theme.colors.error;
    if (remainingTime <= 10) return theme.colors.warning;
    return theme.colors.primary;
  };

  // 남은 시간 퍼센트 (30초 기준)
  const timePercent = (remainingTime / 30) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.7)" }}
    >
      <div
        className="w-full max-w-sm mx-4 shadow-2xl"
        style={{
          background: theme.colors.bg,
          border: `2px solid ${theme.colors.primary}`,
        }}
      >
        {/* 헤더 */}
        <div
          className="px-4 py-3 text-center"
          style={{
            background: `${theme.colors.primary}20`,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <span
            className="text-2xl mb-2 block"
            role="img"
            aria-label="duel"
          >
            ⚔️
          </span>
          <h2
            className="text-lg font-medium font-mono"
            style={{ color: theme.colors.text }}
          >
            결투 신청!
          </h2>
        </div>

        {/* 내용 */}
        <div className="p-4">
          <p
            className="text-center font-mono mb-4"
            style={{ color: theme.colors.text }}
          >
            <span
              className="font-bold"
              style={{ color: theme.colors.primary }}
            >
              {request.challengerName}
            </span>
            <span>님이 결투를 신청했습니다!</span>
          </p>

          {/* 타이머 바 */}
          <div className="mb-4">
            <div
              className="h-1 rounded overflow-hidden"
              style={{ background: theme.colors.bgDark }}
            >
              <div
                className="h-full transition-all duration-1000"
                style={{
                  width: `${timePercent}%`,
                  background: getTimeBarColor(),
                }}
              />
            </div>
            <p
              className="text-center text-sm mt-1 font-mono"
              style={{
                color: remainingTime <= 5 ? theme.colors.error : theme.colors.textMuted,
              }}
            >
              남은 시간: {remainingTime}초
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-2 font-mono text-sm transition-opacity hover:opacity-80"
              style={{
                background: theme.colors.bgDark,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              거절
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2 font-mono text-sm font-medium transition-opacity hover:opacity-80"
              style={{
                background: theme.colors.primary,
                color: theme.colors.bg,
                border: "none",
              }}
            >
              수락
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
