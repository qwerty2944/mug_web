"use client";

import { useThemeStore } from "@/shared/config";

// 전투 액션 탭 타입
export type BattleActionTab = "weapon" | "magic" | "support" | "item";

// 전투 액션 탭 정보
const BATTLE_ACTION_TABS: Record<BattleActionTab, { nameKo: string; icon: string }> = {
  weapon: { nameKo: "무기", icon: "⚔️" },
  magic: { nameKo: "마법", icon: "✨" },
  support: { nameKo: "지원", icon: "💊" },
  item: { nameKo: "아이템", icon: "🎒" },
};

const TAB_ORDER: BattleActionTab[] = ["weapon", "magic", "support", "item"];

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
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 font-mono text-sm transition-colors ${
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
            <span className="hidden sm:inline">{nameKo}</span>
          </button>
        );
      })}
    </div>
  );
}
