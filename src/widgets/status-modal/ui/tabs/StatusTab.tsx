"use client";

import { DynamicUnityCanvas } from "@/features/character";
import {
  getExpPercentage,
  getExpToNextLevel,
  getMaxFatigueFromProfile,
  getCurrentFatigue,
} from "@/entities/user";
import {
  getDodgeChance,
  getBlockChance,
  getCriticalChance,
  getCriticalMultiplier,
} from "@/features/combat";
import { StatTooltip } from "../StatTooltip";
import { ElementBonusItem } from "../ElementBonusItem";
import {
  STAT_TOOLTIPS,
  COMBAT_TOOLTIPS,
} from "../../constants/tooltips";
import type { StatusTabProps } from "./types";

export function StatusTab({
  theme,
  profile,
  mainCharacter,
  derivedStats,
  combatStats,
  elementBonuses,
}: StatusTabProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* 캐릭터 프리뷰 */}
      <div className="lg:w-1/2 flex-shrink-0">
        <div
          className="overflow-hidden h-48 sm:h-56 lg:h-72"
          style={{ background: theme.colors.bgDark }}
        >
          <DynamicUnityCanvas />
        </div>
        {mainCharacter && (
          <div className="mt-3 text-center">
            <h3
              className="text-xl font-mono font-bold"
              style={{ color: theme.colors.text }}
            >
              {mainCharacter.name}
            </h3>
          </div>
        )}
      </div>

      {/* 스탯 정보 */}
      <div className="lg:w-1/2 space-y-4">
        {/* 레벨 & 경험치 */}
        <div className="p-4" style={{ background: theme.colors.bgDark }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono" style={{ color: theme.colors.textMuted }}>레벨</span>
            <span className="text-2xl font-mono font-bold" style={{ color: theme.colors.text }}>
              Lv.{profile?.level || 1}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono" style={{ color: theme.colors.textMuted }}>
              <span>경험치</span>
              <span>{getExpToNextLevel(profile ?? undefined)} EXP 남음</span>
            </div>
            <div className="h-2 overflow-hidden" style={{ background: theme.colors.bgLight }}>
              <div
                className="h-full"
                style={{
                  width: `${getExpPercentage(profile ?? undefined)}%`,
                  background: theme.colors.primary,
                }}
              />
            </div>
          </div>
        </div>

        {/* HP/MP */}
        {mainCharacter?.stats && derivedStats && (
          <div className="p-4 space-y-3" style={{ background: theme.colors.bgDark }}>
            {/* HP */}
            <HpBar theme={theme} profile={profile} derivedStats={derivedStats} />
            {/* MP */}
            <MpBar theme={theme} profile={profile} derivedStats={derivedStats} />
          </div>
        )}

        {/* 피로도 */}
        <div className="p-4" style={{ background: theme.colors.bgDark }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono flex items-center gap-2" style={{ color: theme.colors.textMuted }}>
              <span>⚡</span> 피로도
            </span>
            <span className="text-lg font-mono font-medium" style={{ color: theme.colors.text }}>
              {getCurrentFatigue(profile ?? undefined)} / {getMaxFatigueFromProfile(profile ?? undefined)}
            </span>
          </div>
          <div className="h-3 overflow-hidden" style={{ background: theme.colors.bgLight }}>
            <div
              className="h-full"
              style={{
                width: `${(getCurrentFatigue(profile ?? undefined) / getMaxFatigueFromProfile(profile ?? undefined)) * 100}%`,
                background: theme.colors.success,
              }}
            />
          </div>
        </div>

        {/* 전투 스탯 */}
        {combatStats && (
          <CombatStatsSection theme={theme} combatStats={combatStats} />
        )}

        {/* 속성 보너스 */}
        <div className="p-4" style={{ background: theme.colors.bgDark }}>
          <div className="text-sm font-mono mb-3" style={{ color: theme.colors.textMuted }}>
            속성 보너스
            <span className="text-xs ml-2" style={{ color: theme.colors.primary }}>
              (시간대/날씨/지형)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2">
            {elementBonuses.map((element) => (
              <ElementBonusItem key={element.id} element={element} />
            ))}
          </div>
        </div>

        {/* 능력치 */}
        {mainCharacter?.stats && (
          <StatsSection theme={theme} stats={mainCharacter.stats} />
        )}

        {/* 재화 */}
        <div className="p-4 grid grid-cols-2 gap-4" style={{ background: theme.colors.bgDark }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>골드</div>
              <div className="text-lg font-mono font-medium" style={{ color: theme.colors.warning }}>
                {(profile?.gold || 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💎</span>
            <div>
              <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>젬</div>
              <div className="text-lg font-mono font-medium" style={{ color: theme.colors.primary }}>
                {(profile?.gems || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// HP 바 컴포넌트
function HpBar({ theme, profile, derivedStats }: {
  theme: StatusTabProps["theme"];
  profile: StatusTabProps["profile"];
  derivedStats: NonNullable<StatusTabProps["derivedStats"]>;
}) {
  const maxHp = derivedStats.maxHp;
  const recoverableHp = derivedStats.recoverableHp;
  const currentHp = profile?.currentHp ?? maxHp;
  const hasInjury = derivedStats.injuryRecoveryReduction > 0;

  const currentPercent = (currentHp / maxHp) * 100;
  const recoverablePercent = (recoverableHp / maxHp) * 100;
  const injuryPercent = 100 - recoverablePercent;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono flex items-center gap-2" style={{ color: theme.colors.textMuted }}>
          <span>❤️</span> HP
        </span>
        <div className="text-right">
          <span className="text-lg font-mono font-medium" style={{ color: theme.colors.error }}>
            {currentHp} / {maxHp}
          </span>
          {hasInjury && (
            <span className="text-xs font-mono ml-2" style={{ color: theme.colors.warning }}>
              (회복: {recoverableHp})
            </span>
          )}
        </div>
      </div>
      <div className="h-3 overflow-hidden flex" style={{ background: theme.colors.bgLight }}>
        <div
          className="h-full transition-all"
          style={{
            width: `${currentPercent}%`,
            background: currentPercent > 50 ? theme.colors.error : currentPercent > 20 ? theme.colors.warning : "#ff3333",
          }}
        />
        <div
          className="h-full"
          style={{
            width: `${recoverablePercent - currentPercent}%`,
            background: theme.colors.bgLight,
          }}
        />
        {hasInjury && (
          <div
            className="h-full"
            style={{
              width: `${injuryPercent}%`,
              background: "#4a1515",
            }}
          />
        )}
      </div>
      {hasInjury && (
        <div className="text-xs font-mono mt-1" style={{ color: theme.colors.warning }}>
          🩹 부상으로 HP 회복 상한 -{Math.floor(derivedStats.injuryRecoveryReduction * 100)}%
        </div>
      )}
    </div>
  );
}

// MP 바 컴포넌트
function MpBar({ theme, profile, derivedStats }: {
  theme: StatusTabProps["theme"];
  profile: StatusTabProps["profile"];
  derivedStats: NonNullable<StatusTabProps["derivedStats"]>;
}) {
  const maxMp = derivedStats.maxMp;
  const currentMp = profile?.currentMp ?? maxMp;
  const mpPercent = (currentMp / maxMp) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono flex items-center gap-2" style={{ color: theme.colors.textMuted }}>
          <span>💧</span> MP
        </span>
        <span className="text-lg font-mono font-medium" style={{ color: theme.colors.primary }}>
          {currentMp} / {maxMp}
        </span>
      </div>
      <div className="h-3 overflow-hidden" style={{ background: theme.colors.bgLight }}>
        <div
          className="h-full transition-all"
          style={{
            width: `${mpPercent}%`,
            background: theme.colors.primary,
          }}
        />
      </div>
    </div>
  );
}

// 전투 스탯 섹션
function CombatStatsSection({ theme, combatStats }: {
  theme: StatusTabProps["theme"];
  combatStats: NonNullable<StatusTabProps["combatStats"]>;
}) {
  return (
    <div className="p-4" style={{ background: theme.colors.bgDark }}>
      <div className="text-sm font-mono mb-3" style={{ color: theme.colors.textMuted }}>전투 스탯</div>

      {/* 공격력 / 방어력 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <StatTooltip
          content={
            <div>
              <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.physicalAttack.title}</div>
              <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.physicalAttack.formula}</div>
              <div className="mt-1" style={{ color: theme.colors.text }}>{COMBAT_TOOLTIPS.physicalAttack.effect}</div>
            </div>
          }
        >
          <div className="p-2" style={{ background: theme.colors.bgLight, border: `1px solid ${theme.colors.border}` }}>
            <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>공격력</div>
            <div className="flex items-center gap-2 mt-1">
              <span>⚔️</span>
              <span className="font-mono" style={{ color: theme.colors.error }}>{combatStats.physicalAttack}</span>
              <span style={{ color: theme.colors.textMuted }}>/</span>
              <span>🔮</span>
              <span className="font-mono" style={{ color: theme.colors.primary }}>{combatStats.magicAttack}</span>
            </div>
          </div>
        </StatTooltip>
        <StatTooltip
          content={
            <div>
              <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.physicalDefense.title}</div>
              <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.physicalDefense.formula}</div>
              <div className="mt-1" style={{ color: theme.colors.text }}>{COMBAT_TOOLTIPS.physicalDefense.effect}</div>
            </div>
          }
        >
          <div className="p-2" style={{ background: theme.colors.bgLight, border: `1px solid ${theme.colors.border}` }}>
            <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>방어력</div>
            <div className="flex items-center gap-2 mt-1">
              <span>🛡️</span>
              <span className="font-mono" style={{ color: theme.colors.success }}>{combatStats.physicalDefense}</span>
              <span style={{ color: theme.colors.textMuted }}>/</span>
              <span>🔮</span>
              <span className="font-mono" style={{ color: theme.colors.primary }}>{combatStats.magicDefense}</span>
            </div>
          </div>
        </StatTooltip>
      </div>

      {/* 회피 / 막기 */}
      <div className="grid grid-cols-2 gap-2 text-sm font-mono mb-2">
        <StatTooltip
          content={
            <div>
              <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.dodge.title}</div>
              <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.dodge.formula}</div>
              <div style={{ color: theme.colors.warning }}>{COMBAT_TOOLTIPS.dodge.max}</div>
              <div className="mt-1" style={{ color: theme.colors.text }}>{COMBAT_TOOLTIPS.dodge.effect}</div>
            </div>
          }
        >
          <div className="flex items-center gap-2">
            <span>🌀</span>
            <span style={{ color: theme.colors.textMuted }}>회피</span>
            <span className="ml-auto" style={{ color: theme.colors.text }}>{combatStats.dodgeChance.toFixed(1)}%</span>
          </div>
        </StatTooltip>
        <StatTooltip
          content={
            <div>
              <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.block.title}</div>
              <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.block.formula}</div>
              <div style={{ color: theme.colors.warning }}>{COMBAT_TOOLTIPS.block.max}</div>
              <div className="mt-1" style={{ color: theme.colors.text }}>{COMBAT_TOOLTIPS.block.effect}</div>
            </div>
          }
        >
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span style={{ color: theme.colors.textMuted }}>막기</span>
            <span className="ml-auto" style={{ color: theme.colors.text }}>{combatStats.blockChance.toFixed(1)}%</span>
          </div>
        </StatTooltip>
      </div>

      {/* 치명타 */}
      <div className="grid grid-cols-2 gap-2 text-sm font-mono mb-2">
        <StatTooltip
          content={
            <div>
              <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.physCrit.title}</div>
              <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.physCrit.formula}</div>
              <div style={{ color: theme.colors.warning }}>{COMBAT_TOOLTIPS.physCrit.max}</div>
            </div>
          }
        >
          <div className="flex items-center gap-2">
            <span>💥</span>
            <span style={{ color: theme.colors.textMuted }}>물리치명</span>
            <span className="ml-auto" style={{ color: theme.colors.error }}>{combatStats.physicalCritChance.toFixed(1)}%</span>
          </div>
        </StatTooltip>
        <StatTooltip
          content={
            <div>
              <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.magicCrit.title}</div>
              <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.magicCrit.formula}</div>
              <div style={{ color: theme.colors.warning }}>{COMBAT_TOOLTIPS.magicCrit.max}</div>
            </div>
          }
        >
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span style={{ color: theme.colors.textMuted }}>마법치명</span>
            <span className="ml-auto" style={{ color: theme.colors.primary }}>{combatStats.magicalCritChance.toFixed(1)}%</span>
          </div>
        </StatTooltip>
      </div>

      {/* 치명타 배율 */}
      <StatTooltip
        content={
          <div>
            <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>{COMBAT_TOOLTIPS.critMult.title}</div>
            <div style={{ color: theme.colors.textMuted }}>{COMBAT_TOOLTIPS.critMult.formula}</div>
            <div style={{ color: theme.colors.warning }}>{COMBAT_TOOLTIPS.critMult.max}</div>
          </div>
        }
      >
        <div className="flex items-center gap-2 text-sm font-mono">
          <span>⚡</span>
          <span style={{ color: theme.colors.textMuted }}>치명 배율</span>
          <span className="ml-auto" style={{ color: theme.colors.warning }}>{combatStats.critMultiplier.toFixed(2)}x</span>
        </div>
      </StatTooltip>
    </div>
  );
}

// 능력치 섹션
function StatsSection({ theme, stats }: {
  theme: StatusTabProps["theme"];
  stats: { str: number; dex: number; con: number; int: number; wis: number; cha: number; lck: number };
}) {
  const statItems = [
    { key: "str", label: "힘", icon: "💪" },
    { key: "dex", label: "민첩", icon: "🏃" },
    { key: "con", label: "체력", icon: "❤️" },
    { key: "int", label: "지능", icon: "🧠" },
    { key: "wis", label: "지혜", icon: "🔮" },
    { key: "cha", label: "매력", icon: "✨" },
    { key: "lck", label: "행운", icon: "🍀" },
  ];

  return (
    <div className="p-4" style={{ background: theme.colors.bgDark }}>
      <div className="text-sm font-mono mb-3" style={{ color: theme.colors.textMuted }}>능력치</div>
      <div className="grid grid-cols-2 gap-2">
        {statItems.map(({ key, label, icon }) => {
          const tooltip = STAT_TOOLTIPS[key];
          return (
            <StatTooltip
              key={key}
              content={
                <div>
                  <div className="font-bold mb-1" style={{ color: theme.colors.primary }}>
                    {tooltip?.title || label}
                  </div>
                  {tooltip?.effects.map((effect, i) => (
                    <div key={i} style={{ color: theme.colors.textMuted }}>
                      {effect}
                    </div>
                  ))}
                </div>
              }
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{icon}</span>
                <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>{label}</span>
                <span className="font-mono font-medium ml-auto" style={{ color: theme.colors.text }}>
                  {stats[key as keyof typeof stats] ?? 10}
                </span>
              </div>
            </StatTooltip>
          );
        })}
      </div>
    </div>
  );
}
