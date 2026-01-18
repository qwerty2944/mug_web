"use client";

import { TraitList } from "@/entities/trait";
import type { TraitsTabProps } from "./types";

export function TraitsTab({ theme, characterTraits, traitEffects }: TraitsTabProps) {
  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div
        className="flex items-center justify-between p-3"
        style={{ background: theme.colors.bgDark }}
      >
        <span className="font-mono" style={{ color: theme.colors.text }}>
          📋 보유 특성 ({characterTraits.length}개)
        </span>
      </div>

      {/* 트레이트 목록 (카테고리별) */}
      <div className="p-4" style={{ background: theme.colors.bgDark }}>
        <TraitList
          traits={characterTraits}
          groupByCategory
          emptyMessage="보유한 특성이 없습니다"
        />
      </div>

      {/* 효과 요약 */}
      {traitEffects && (
        <div className="p-4" style={{ background: theme.colors.bgDark }}>
          <div
            className="text-sm font-mono mb-3"
            style={{ color: theme.colors.textMuted }}
          >
            📊 특성 효과 요약
          </div>
          <div className="text-xs font-mono space-y-1">
            {/* 스탯 수정자 */}
            {Object.entries(traitEffects.statModifiers).map(([stat, value]) => {
              if (!value) return null;
              const statNames: Record<string, string> = {
                str: "힘", dex: "민첩", con: "체력", int: "지능",
                wis: "지혜", cha: "매력", lck: "행운",
              };
              const sign = value > 0 ? "+" : "";
              return (
                <div key={stat} style={{ color: theme.colors.text }}>
                  {statNames[stat] ?? stat} {sign}{value}
                </div>
              );
            })}
            {/* 특수 효과 */}
            {Array.from(traitEffects.specialEffects.entries()).map(([type, value]) => {
              const effectNames: Record<string, string> = {
                fear_resistance: "공포 저항", disease_resistance: "질병 저항",
                poison_resistance: "독 저항", physical_damage: "물리 데미지",
                magic_damage: "마법 데미지", critical_chance: "치명타 확률",
                dodge_chance: "회피 확률", gold_gain: "골드 획득",
                exp_gain: "경험치 획득", healing_power: "치유량",
              };
              const sign = value > 0 ? "+" : "";
              return (
                <div key={type} style={{ color: theme.colors.text }}>
                  {effectNames[type] ?? type} {sign}{value}%
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
