"use client";

import { useMemo } from "react";
import { useThemeStore } from "@/shared/config";
import { useBattleStore } from "@/application/stores";
import type { Ability, AbilityType } from "@/entities/ability";
import { getApCost, getMpCost } from "@/entities/ability";

interface AbilitySelectorProps {
  abilities: Ability[];
  abilityLevels: Record<string, number>; // 어빌리티 ID → 레벨
  onSelectAbility: (ability: Ability, level: number) => void;
  disabled?: boolean;
  filterType?: AbilityType | "all";
}

export function AbilitySelector({
  abilities,
  abilityLevels,
  onSelectAbility,
  disabled,
  filterType = "all",
}: AbilitySelectorProps) {
  const { theme } = useThemeStore();
  const { battle, canAffordAp, getRemainingPlayerAp } = useBattleStore();

  const remainingAp = getRemainingPlayerAp();

  // 필터링된 어빌리티 (배운 것만 = level >= 1)
  const filteredAbilities = useMemo(() => {
    let result = abilities;

    // 타입 필터
    if (filterType !== "all") {
      result = result.filter((a) => a.type === filterType);
    }

    // 배운 어빌리티만 (level >= 1)
    result = result.filter((a) => {
      const level = abilityLevels[a.id] ?? 0;
      return level >= 1;
    });

    return result;
  }, [abilities, filterType, abilityLevels]);

  // 어빌리티별로 사용 가능 여부 체크
  const getAbilityStatus = (ability: Ability) => {
    const level = abilityLevels[ability.id] ?? 1;
    const apCost = getApCost(ability, level);
    const mpCost = getMpCost(ability, level);

    const canAfford = canAffordAp(apCost);
    const hasEnoughMp = battle.playerMp >= mpCost;

    return {
      level,
      apCost,
      mpCost,
      canUse: canAfford && hasEnoughMp,
      reason: !canAfford
        ? `AP 부족 (${remainingAp}/${apCost})`
        : !hasEnoughMp
        ? `MP 부족 (${battle.playerMp}/${mpCost})`
        : null,
    };
  };

  const getTypeColor = (type: AbilityType) => {
    switch (type) {
      case "attack":
        return theme.colors.error;
      case "heal":
        return theme.colors.success;
      case "buff":
        return theme.colors.primary;
      case "debuff":
        return "#A855F7";
      case "defense":
        return theme.colors.warning;
      default:
        return theme.colors.textMuted;
    }
  };

  if (filteredAbilities.length === 0) {
    return (
      <div
        className="px-4 py-8 text-center font-mono text-sm"
        style={{ color: theme.colors.textMuted }}
      >
        사용 가능한 어빌리티가 없습니다.
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="grid grid-cols-2 gap-2">
      {filteredAbilities.map((ability) => {
        const status = getAbilityStatus(ability);
        const typeColor = getTypeColor(ability.type);

        return (
          <button
            key={ability.id}
            onClick={() => onSelectAbility(ability, status.level)}
            disabled={disabled || !status.canUse}
            className="p-2 font-mono text-left transition-all"
            style={{
              background: status.canUse
                ? `${typeColor}10`
                : theme.colors.bgDark,
              border: `1px solid ${status.canUse ? typeColor : theme.colors.border}`,
              opacity: status.canUse ? 1 : 0.5,
              cursor: status.canUse ? "pointer" : "not-allowed",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{ability.icon || "⚔️"}</span>
              <span
                className="text-sm font-bold truncate"
                style={{ color: status.canUse ? theme.colors.text : theme.colors.textMuted }}
              >
                {ability.nameKo}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span style={{ color: theme.colors.warning }}>
                AP {status.apCost}
              </span>
              {status.mpCost > 0 && (
                <span style={{ color: theme.colors.primary }}>
                  MP {status.mpCost}
                </span>
              )}
            </div>
            {!status.canUse && status.reason && (
              <div
                className="text-[10px] mt-1"
                style={{ color: theme.colors.error }}
              >
                {status.reason}
              </div>
            )}
          </button>
        );
      })}
      </div>
    </div>
  );
}
