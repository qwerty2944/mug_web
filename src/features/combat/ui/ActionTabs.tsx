"use client";

import { useThemeStore } from "@/shared/config";

// 메인 전투 탭 (abilities 폴더 구조 기반)
export type BattleActionTab = "combat" | "magic" | "item";

// 전투 스킬 서브탭 (combatskill 폴더 구조)
export type CombatSubTab = "all" | "weapon" | "martial" | "defense" | "utility" | "warcry";

// 탭 정보
const BATTLE_ACTION_TABS: Record<BattleActionTab, { nameKo: string; icon: string }> = {
  combat: { nameKo: "전투", icon: "⚔️" },
  magic: { nameKo: "마법", icon: "✨" },
  item: { nameKo: "소비", icon: "🎒" },
};

const TAB_ORDER: BattleActionTab[] = ["combat", "magic", "item"];

interface ActionTabsProps {
  activeTab: BattleActionTab;
  onTabChange: (tab: BattleActionTab) => void;
  disabled?: boolean;
}

export function ActionTabs({
  activeTab,
  onTabChange,
  disabled = false,
}: ActionTabsProps) {
  const { theme } = useThemeStore();

  return (
    <div
      className="flex border-b"
      style={{ borderColor: theme.colors.border }}
    >
      {TAB_ORDER.map((tab) => {
        const isActive = activeTab === tab;
        const { nameKo, icon } = BATTLE_ACTION_TABS[tab];

        return (
          <button
            key={tab}
            onClick={() => !disabled && onTabChange(tab)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 font-mono text-sm transition-colors ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{
              background: isActive ? theme.colors.bg : theme.colors.bgDark,
              color: isActive ? theme.colors.primary : theme.colors.textMuted,
              borderBottom: isActive
                ? `2px solid ${theme.colors.primary}`
                : "2px solid transparent",
            }}
          >
            <span>{icon}</span>
            <span>{nameKo}</span>
          </button>
        );
      })}
    </div>
  );
}

// 전투 스킬 서브탭 정보
export const COMBAT_SUB_TABS: Record<CombatSubTab, { nameKo: string; icon: string }> = {
  all: { nameKo: "전체", icon: "📋" },
  weapon: { nameKo: "무기", icon: "⚔️" },
  martial: { nameKo: "무술", icon: "👊" },
  defense: { nameKo: "방어", icon: "🛡️" },
  utility: { nameKo: "전술", icon: "🎯" },
  warcry: { nameKo: "함성", icon: "📢" },
};

export const COMBAT_SUB_TAB_ORDER: CombatSubTab[] = ["all", "weapon", "martial", "defense", "utility", "warcry"];

interface CombatSubTabsProps {
  activeSubTab: CombatSubTab;
  onSubTabChange: (subTab: CombatSubTab) => void;
  availableCategories: string[];
  disabled?: boolean;
}

export function CombatSubTabs({
  activeSubTab,
  onSubTabChange,
  availableCategories,
  disabled = false,
}: CombatSubTabsProps) {
  const { theme } = useThemeStore();

  return (
    <div
      className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin"
      style={{ borderBottom: `1px solid ${theme.colors.borderDim}` }}
    >
      {COMBAT_SUB_TAB_ORDER.map((subTab) => {
        const isActive = activeSubTab === subTab;
        const isAvailable = subTab === "all" || availableCategories.includes(subTab);
        const { nameKo, icon } = COMBAT_SUB_TABS[subTab];

        return (
          <button
            key={subTab}
            onClick={() => !disabled && isAvailable && onSubTabChange(subTab)}
            disabled={disabled || !isAvailable}
            className="flex items-center gap-0.5 px-2 py-1 text-xs font-mono whitespace-nowrap transition-colors"
            style={{
              background: isActive ? theme.colors.primary + "30" : "transparent",
              color: isActive
                ? theme.colors.primary
                : isAvailable
                ? theme.colors.text
                : theme.colors.textMuted,
              borderRadius: "4px",
              opacity: disabled || !isAvailable ? 0.4 : 1,
              cursor: disabled || !isAvailable ? "not-allowed" : "pointer",
            }}
            title={isAvailable ? nameKo : `${nameKo} 스킬 없음`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{nameKo}</span>
          </button>
        );
      })}
    </div>
  );
}
