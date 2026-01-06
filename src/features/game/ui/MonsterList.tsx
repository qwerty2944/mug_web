"use client";

import { useMonstersByMap, getMonsterDisplayName, getMonsterDescription } from "@/entities/monster";
import { useThemeStore } from "@/shared/config";
import type { Monster } from "@/entities/monster";

interface MonsterListProps {
  mapId: string;
  playerLevel: number;
  onSelectMonster: (monster: Monster) => void;
  disabled?: boolean;
}

export function MonsterList({
  mapId,
  playerLevel,
  onSelectMonster,
  disabled = false,
}: MonsterListProps) {
  const { theme } = useThemeStore();
  const { data: monsters = [], isLoading } = useMonstersByMap(mapId);

  if (isLoading) {
    return (
      <div
        className="p-4"
        style={{
          background: theme.colors.bg,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div className="text-sm text-center font-mono" style={{ color: theme.colors.textMuted }}>
          몬스터 로딩 중...
        </div>
      </div>
    );
  }

  if (monsters.length === 0) {
    return (
      <div
        className="p-4"
        style={{
          background: theme.colors.bg,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <div
          className="text-sm text-center font-mono py-2"
          style={{ color: theme.colors.textMuted }}
        >
          이 지역에는 몬스터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overflow-hidden flex-shrink-0"
      style={{
        background: theme.colors.bg,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {/* 헤더 */}
      <div
        className="px-3 py-2 flex items-center justify-between border-b"
        style={{
          background: theme.colors.bgLight,
          borderColor: theme.colors.border,
        }}
      >
        <span className="text-sm font-mono font-medium" style={{ color: theme.colors.text }}>
          ⚔️ 전투
        </span>
        <span className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
          {monsters.length}종 출현
        </span>
      </div>

      {/* 몬스터 목록 */}
      <div className="p-2 space-y-2 max-h-40 overflow-y-auto flex-1 min-h-0">
        {monsters.map((monster) => {
          const levelDiff = monster.level - playerLevel;
          const diffColor =
            levelDiff > 3
              ? theme.colors.error
              : levelDiff > 0
              ? theme.colors.warning
              : theme.colors.success;

          return (
            <button
              key={monster.id}
              onClick={() => !disabled && onSelectMonster(monster)}
              disabled={disabled}
              className="w-full flex items-center gap-3 px-3 py-2 transition-colors text-left"
              style={{
                background: theme.colors.bgDark,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              <span className="text-2xl flex-shrink-0">{monster.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-mono font-medium truncate"
                    style={{ color: theme.colors.text }}
                  >
                    {getMonsterDisplayName(monster)}
                  </span>
                  <span
                    className="text-xs font-mono px-1.5 py-0.5"
                    style={{
                      background: `${diffColor}20`,
                      color: diffColor,
                    }}
                  >
                    Lv.{monster.level}
                  </span>
                  {monster.element && (
                    <span className="text-xs">{getElementIcon(monster.element)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-xs font-mono"
                    style={{ color: theme.colors.textMuted }}
                  >
                    HP {monster.stats.hp}
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: theme.colors.textMuted }}
                  >
                    ·
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: theme.colors.textMuted }}
                  >
                    {getBehaviorText(monster.behavior)}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-xs font-mono" style={{ color: theme.colors.warning }}>
                  +{monster.rewards.exp} exp
                </div>
                {monster.rewards.gold > 0 && (
                  <div className="text-xs font-mono" style={{ color: theme.colors.textMuted }}>
                    +{monster.rewards.gold} gold
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getElementIcon(element: string): string {
  const icons: Record<string, string> = {
    fire: "🔥",
    ice: "❄️",
    lightning: "⚡",
    earth: "🪨",
    holy: "✨",
    dark: "🌑",
  };
  return icons[element] || "";
}

function getBehaviorText(behavior: string): string {
  const texts: Record<string, string> = {
    passive: "수동적",
    aggressive: "공격적",
    defensive: "방어적",
  };
  return texts[behavior] || behavior;
}
