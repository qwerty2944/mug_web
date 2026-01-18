"use client";

import { useState } from "react";
import { useThemeStore } from "@/application/stores";
import type { Theme } from "@/shared/config";

export interface ElementBonusData {
  id: string;
  nameKo: string;
  icon: string;
  baseBonus: number;
  timeBonus: number;
  weatherBonus: number;
  terrainBonus: number;
  totalBonus: number;
}

interface ElementBonusItemProps {
  element: ElementBonusData;
}

export function ElementBonusItem({ element }: ElementBonusItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { theme } = useThemeStore();

  const hasBonus = element.totalBonus !== 0;
  const bonusColor =
    element.totalBonus > 0
      ? theme.colors.success
      : element.totalBonus < 0
        ? theme.colors.error
        : theme.colors.textMuted;

  // 보너스 소스 아이콘들
  const sourceIcons: string[] = [];
  if (element.timeBonus !== 0) sourceIcons.push(element.timeBonus > 0 ? "🌙" : "☀️");
  if (element.weatherBonus !== 0) sourceIcons.push("🌧️");
  if (element.terrainBonus !== 0) sourceIcons.push("🌲");

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className="flex flex-col items-center p-1.5 cursor-help transition-all"
        style={{
          background: hasBonus ? `${theme.colors.primary}10` : "transparent",
          border: hasBonus
            ? `1px solid ${theme.colors.primary}30`
            : `1px solid ${theme.colors.border}`,
          minHeight: "72px", // 레이아웃 시프트 방지
        }}
      >
        <span className="text-lg">{element.icon}</span>
        <span className="text-xs font-mono" style={{ color: bonusColor }}>
          {element.totalBonus >= 0 ? "+" : ""}
          {element.totalBonus}%
        </span>
        {/* sourceIcons 영역 - 항상 공간 예약 */}
        <span
          className="text-[10px] leading-none"
          style={{
            minHeight: "14px",
            visibility: sourceIcons.length > 0 ? "visible" : "hidden",
          }}
        >
          {sourceIcons.length > 0 ? sourceIcons.join("") : "\u00A0"}
        </span>
      </div>

      {/* 툴팁 */}
      {showTooltip && (
        <ElementTooltip element={element} theme={theme} bonusColor={bonusColor} />
      )}
    </div>
  );
}

function ElementTooltip({
  element,
  theme,
  bonusColor,
}: {
  element: ElementBonusData;
  theme: Theme;
  bonusColor: string;
}) {
  return (
    <div
      className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 min-w-[140px] pointer-events-none"
      style={{
        background: theme.colors.bgLight,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: `0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px ${theme.colors.primary}20`,
      }}
    >
      {/* 헤더 */}
      <div
        className="flex items-center gap-2 mb-2 pb-2 border-b"
        style={{ borderColor: theme.colors.border }}
      >
        <span className="text-lg">{element.icon}</span>
        <span className="font-mono font-bold text-sm" style={{ color: theme.colors.text }}>
          {element.nameKo}
        </span>
      </div>

      {/* 보너스 분해 */}
      <div className="space-y-1 text-xs font-mono">
        <BonusRow
          label="기본"
          value={element.baseBonus}
          theme={theme}
          showZero
        />
        {element.timeBonus !== 0 && (
          <BonusRow
            label="🌙 시간대"
            value={element.timeBonus}
            theme={theme}
          />
        )}
        {element.weatherBonus !== 0 && (
          <BonusRow
            label="🌧️ 날씨"
            value={element.weatherBonus}
            theme={theme}
          />
        )}
        {element.terrainBonus !== 0 && (
          <BonusRow
            label="🌲 지형"
            value={element.terrainBonus}
            theme={theme}
          />
        )}

        {/* 총합 */}
        <div
          className="flex justify-between pt-1 border-t"
          style={{ borderColor: theme.colors.border }}
        >
          <span style={{ color: theme.colors.primary }}>총합</span>
          <span style={{ color: bonusColor, fontWeight: "bold" }}>
            {element.totalBonus >= 0 ? "+" : ""}
            {element.totalBonus}%
          </span>
        </div>
      </div>
    </div>
  );
}

function BonusRow({
  label,
  value,
  theme,
  showZero = false,
}: {
  label: string;
  value: number;
  theme: Theme;
  showZero?: boolean;
}) {
  if (value === 0 && !showZero) return null;

  const color =
    value > 0
      ? theme.colors.success
      : value < 0
        ? theme.colors.error
        : theme.colors.textMuted;

  return (
    <div className="flex justify-between">
      <span style={{ color: theme.colors.textMuted }}>{label}</span>
      <span style={{ color }}>
        {value >= 0 ? "+" : ""}
        {value}%
      </span>
    </div>
  );
}
