"use client";

import { useThemeStore } from "@/application/stores";

interface StreakBadgeProps {
  streak: number;
  compact?: boolean;
}

/**
 * 연속 출석 배지
 * - compact: 헤더용 작은 배지
 * - 전체: 상세 표시
 */
export function StreakBadge({ streak, compact = false }: StreakBadgeProps) {
  const { theme } = useThemeStore();

  if (streak <= 0) return null;

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[10px] font-mono"
        style={{ color: theme.colors.primary }}
        title={`${streak}일 연속 출석`}
      >
        {streak}
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono rounded"
      style={{
        background: `${theme.colors.primary}20`,
        color: theme.colors.primary,
        border: `1px solid ${theme.colors.primary}40`,
      }}
    >
      <span>{streak}일 연속</span>
    </div>
  );
}
