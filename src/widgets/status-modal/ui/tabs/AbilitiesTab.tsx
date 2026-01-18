"use client";

import { useMemo } from "react";
import type { AbilitiesTabProps } from "./types";
import type { AbilityProgress } from "@/entities/ability";

// 어빌리티 진행도 가져오기 (레벨과 경험치)
function getAbilityProgress(
  userAbilities: AbilitiesTabProps["userAbilities"],
  abilityId: string
): AbilityProgress | null {
  if (!userAbilities) return null;

  // combat, magic, life 순서로 검색
  for (const category of ["combat", "magic", "life"] as const) {
    const progress = userAbilities[category][abilityId];
    if (progress) return progress;
  }
  return null;
}

export function AbilitiesTab({ theme, learnedSkills, abilities, userAbilities, isLoading }: AbilitiesTabProps) {
  // userAbilities에서 레벨 1 이상인 스킬 목록
  const dbLearnedSkills = useMemo(() => {
    if (!userAbilities) return [];

    const result: string[] = [];
    for (const category of ["combat", "magic", "life"] as const) {
      for (const [abilityId, progress] of Object.entries(userAbilities[category])) {
        if (progress.level >= 1) {
          result.push(abilityId);
        }
      }
    }
    return result;
  }, [userAbilities]);

  // 레벨 0이지만 경험치가 있는 어빌리티 목록 생성
  const inProgressSkills = useMemo(() => {
    if (!userAbilities) return [];

    const result: string[] = [];
    for (const category of ["combat", "magic", "life"] as const) {
      for (const [abilityId, progress] of Object.entries(userAbilities[category])) {
        // 레벨 0이고 경험치가 있는 것
        if (progress.level === 0 && progress.exp > 0) {
          result.push(abilityId);
        }
      }
    }
    return result;
  }, [userAbilities]);

  // 모든 표시할 스킬 (DB 스킬 + 로컬 스킬 + 진행 중 스킬, 중복 제거)
  const allDisplaySkills = useMemo(() => {
    const combined = new Set([...dbLearnedSkills, ...learnedSkills, ...inProgressSkills]);
    return Array.from(combined);
  }, [dbLearnedSkills, learnedSkills, inProgressSkills]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full"
          style={{ borderColor: theme.colors.primary, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (allDisplaySkills.length === 0) {
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
      {allDisplaySkills.map((skillId) => {
        const ability = abilities.find((a) => a.id === skillId);
        const progress = getAbilityProgress(userAbilities, skillId);
        const isInProgress = inProgressSkills.includes(skillId); // 레벨 0, 경험치 있음

        return (
          <div
            key={skillId}
            className="p-4 flex items-start gap-3"
            style={{
              background: theme.colors.bgDark,
              border: `1px solid ${theme.colors.border}`,
              opacity: isInProgress ? 0.5 : 1,
            }}
          >
            <span className="text-3xl" style={{ opacity: isInProgress ? 0.6 : 1 }}>
              {ability?.icon ?? "📖"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium" style={{ color: theme.colors.text }}>
                  {ability?.nameKo ?? skillId}
                </span>
                {progress && (
                  <span
                    className="text-xs font-mono px-1.5 py-0.5"
                    style={{
                      background: isInProgress ? theme.colors.bgLight : `${theme.colors.primary}20`,
                      color: isInProgress ? theme.colors.textMuted : theme.colors.primary,
                    }}
                  >
                    Lv.{progress.level}
                  </span>
                )}
              </div>
              {ability?.description?.ko && (
                <div
                  className="text-sm font-mono mt-1"
                  style={{ color: theme.colors.textMuted }}
                >
                  {ability.description.ko}
                </div>
              )}
              {/* 진행 중인 스킬의 경험치 표시 */}
              {isInProgress && progress && (
                <div
                  className="text-xs font-mono mt-1"
                  style={{ color: theme.colors.textMuted }}
                >
                  경험치: {progress.exp}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
