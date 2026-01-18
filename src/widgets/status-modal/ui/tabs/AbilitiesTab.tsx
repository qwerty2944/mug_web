"use client";

import type { AbilitiesTabProps } from "./types";

export function AbilitiesTab({ theme, learnedSkills, abilities }: AbilitiesTabProps) {
  if (learnedSkills.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center h-64 font-mono"
        style={{ color: theme.colors.textMuted }}
      >
        <p className="text-4xl mb-4">📖</p>
        <p>습득한 어빌리티가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {learnedSkills.map((skillId) => {
        const ability = abilities.find((a) => a.id === skillId);
        return (
          <div
            key={skillId}
            className="p-4 flex items-start gap-3"
            style={{
              background: theme.colors.bgDark,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <span className="text-3xl">{ability?.icon ?? "📖"}</span>
            <div className="flex-1 min-w-0">
              <div className="font-mono font-medium" style={{ color: theme.colors.text }}>
                {ability?.nameKo ?? skillId}
              </div>
              {ability?.description?.ko && (
                <div
                  className="text-sm font-mono mt-1"
                  style={{ color: theme.colors.textMuted }}
                >
                  {ability.description.ko}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
