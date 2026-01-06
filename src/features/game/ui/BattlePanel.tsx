"use client";

import { useState, useEffect, useCallback } from "react";
import { useBattleStore } from "@/application/stores";
import { useThemeStore } from "@/shared/config";
import type { CharacterStats } from "@/entities/character";
import type { ProficiencyType } from "@/entities/proficiency";
import type { Skill, SkillCategory } from "@/entities/skill";
import { useAttack, useCastSpell, calculateMonsterDamage } from "@/features/combat";
import { BattleHeader } from "./battle/BattleHeader";
import { BattleLog } from "./battle/BattleLog";
import { ActionTabs } from "./battle/ActionTabs";
import { ActionPanel } from "./battle/ActionPanel";

interface BattlePanelProps {
  characterStats: CharacterStats;
  proficiencies: Record<ProficiencyType, number>;
  onFlee: () => void;
  onVictory: () => void;
  onDefeat: () => void;
}

export function BattlePanel({
  characterStats,
  proficiencies,
  onFlee,
  onVictory,
  onDefeat,
}: BattlePanelProps) {
  const { theme } = useThemeStore();
  const {
    battle,
    playerFlee,
    resetBattle,
    monsterAttack,
    monsterPreemptiveAttack,
    processStatusEffects,
    tickAllStatuses,
    getPlayerDefModifier,
    getMonsterAtkModifier,
    isPlayerIncapacitated,
  } = useBattleStore();

  const [activeTab, setActiveTab] = useState<SkillCategory>("weapon");

  // 몬스터 턴 처리 (마법/버프 사용 후)
  const handleMonsterTurn = useCallback(() => {
    if (!battle.monster || battle.result !== "ongoing") return;
    if (battle.monster.behavior === "passive") return;

    // 플레이어 방어력 수정치
    const defModifier = getPlayerDefModifier();
    const baseDefense = Math.floor((characterStats.con || 10) * 0.5);
    const finalDefense = Math.max(0, baseDefense + defModifier);

    // 몬스터 공격력 수정치
    const atkModifier = getMonsterAtkModifier();
    const monsterAtk = Math.max(
      1,
      battle.monster.stats.attack * (1 + atkModifier / 100)
    );

    const damage = calculateMonsterDamage(monsterAtk, finalDefense);
    const message = `${battle.monster.icon} ${battle.monster.nameKo}의 공격! ${damage} 데미지!`;

    monsterAttack(damage, message);
  }, [
    battle,
    characterStats,
    getPlayerDefModifier,
    getMonsterAtkModifier,
    monsterAttack,
  ]);

  // 무기 공격 (useAttack이 내부적으로 몬스터 반격 처리)
  const { attack: performWeaponAttack } = useAttack();

  // 마법 시전
  const { castSpell } = useCastSpell({
    onMonsterTurn: handleMonsterTurn,
  });

  // 무기 공격 핸들러
  const handleWeaponAttack = useCallback(
    (weaponType: ProficiencyType) => {
      if (isPlayerIncapacitated()) {
        return;
      }

      const stats = characterStats;
      const profLevel = proficiencies[weaponType] ?? 0;

      // 상태이상 처리 (턴 시작)
      processStatusEffects();

      performWeaponAttack({
        attackType: weaponType,
        proficiencyLevel: profLevel,
        attackerStats: stats,
        baseDamage: 10 + (battle.turn || 1),
        playerDefense: Math.floor((stats.con || 10) * 0.5),
      });

      // 상태이상 지속시간 감소
      tickAllStatuses();
    },
    [
      characterStats,
      proficiencies,
      performWeaponAttack,
      processStatusEffects,
      tickAllStatuses,
      isPlayerIncapacitated,
      battle.turn,
    ]
  );

  // 스킬 시전 핸들러
  const handleCastSkill = useCallback(
    (skill: Skill) => {
      if (isPlayerIncapacitated()) {
        return;
      }

      // 상태이상 처리 (턴 시작)
      processStatusEffects();

      const profLevel = skill.proficiencyType
        ? proficiencies[skill.proficiencyType as ProficiencyType] ?? 0
        : 0;

      castSpell({
        skill,
        casterStats: characterStats,
        proficiencyLevel: profLevel,
      });

      // 상태이상 지속시간 감소
      tickAllStatuses();
    },
    [
      characterStats,
      proficiencies,
      castSpell,
      processStatusEffects,
      tickAllStatuses,
      isPlayerIncapacitated,
    ]
  );

  // 도주 핸들러
  const handleFlee = useCallback(() => {
    const success = playerFlee();
    if (success) {
      onFlee();
    } else {
      // 도주 실패 시 몬스터 턴
      setTimeout(handleMonsterTurn, 500);
    }
  }, [playerFlee, onFlee, handleMonsterTurn]);

  // 전투 결과 처리
  useEffect(() => {
    if (battle.result === "victory") {
      const timer = setTimeout(onVictory, 1500);
      return () => clearTimeout(timer);
    } else if (battle.result === "defeat") {
      const timer = setTimeout(onDefeat, 1500);
      return () => clearTimeout(timer);
    } else if (battle.result === "fled") {
      const timer = setTimeout(() => resetBattle(), 1500);
      return () => clearTimeout(timer);
    }
  }, [battle.result, onVictory, onDefeat, resetBattle]);

  // 선제공격 처리 (aggressive 몬스터)
  useEffect(() => {
    if (
      battle.isInBattle &&
      battle.isPreemptivePhase &&
      battle.monsterGoesFirst &&
      battle.monster &&
      battle.result === "ongoing"
    ) {
      const timer = setTimeout(() => {
        // 플레이어 방어력 계산
        const defModifier = getPlayerDefModifier();
        const baseDefense = Math.floor((characterStats.con || 10) * 0.5);
        const finalDefense = Math.max(0, baseDefense + defModifier);

        // 몬스터 공격력 계산
        const atkModifier = getMonsterAtkModifier();
        const monsterAtk = Math.max(
          1,
          battle.monster!.stats.attack * (1 + atkModifier / 100)
        );

        const damage = calculateMonsterDamage(monsterAtk, finalDefense);
        const message = `${battle.monster!.icon} ${battle.monster!.nameKo}의 선제 공격! ${damage} 데미지!`;

        monsterPreemptiveAttack(damage, message);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    battle.isInBattle,
    battle.isPreemptivePhase,
    battle.monsterGoesFirst,
    battle.monster,
    battle.result,
    characterStats,
    getPlayerDefModifier,
    getMonsterAtkModifier,
    monsterPreemptiveAttack,
  ]);

  if (!battle.isInBattle || !battle.monster) return null;

  const isOngoing = battle.result === "ongoing";
  const isIncapacitated = isPlayerIncapacitated();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
    >
      <div
        className="w-full max-w-lg overflow-hidden"
        style={{
          background: theme.colors.bg,
          border: `2px solid ${theme.colors.border}`,
        }}
      >
        {/* 헤더 (몬스터/플레이어 HP/MP, 상태이상) */}
        <BattleHeader />

        {/* 전투 로그 */}
        <BattleLog />

        {/* 액션 영역 */}
        {isOngoing ? (
          <>
            {/* 행동 불가 상태 표시 */}
            {isIncapacitated && (
              <div
                className="px-4 py-2 text-center font-mono text-sm"
                style={{
                  background: `${theme.colors.error}20`,
                  color: theme.colors.error,
                }}
              >
                🧊 행동 불가 상태!
              </div>
            )}

            {/* 액션 탭 */}
            <ActionTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              disabled={isIncapacitated}
            />

            {/* 액션 패널 */}
            <ActionPanel
              activeTab={activeTab}
              proficiencies={proficiencies}
              onWeaponAttack={handleWeaponAttack}
              onCastSkill={handleCastSkill}
              onFlee={handleFlee}
              disabled={isIncapacitated}
            />
          </>
        ) : (
          <BattleResult result={battle.result} monster={battle.monster} />
        )}
      </div>
    </div>
  );
}

// 전투 결과 컴포넌트
interface BattleResultProps {
  result: "victory" | "defeat" | "fled" | "ongoing";
  monster: { nameKo: string; rewards: { exp: number; gold: number } } | null;
}

function BattleResult({ result, monster }: BattleResultProps) {
  const { theme } = useThemeStore();

  return (
    <div
      className="text-center py-6 font-mono"
      style={{
        color:
          result === "victory"
            ? theme.colors.success
            : result === "defeat"
            ? theme.colors.error
            : theme.colors.textMuted,
      }}
    >
      {result === "victory" && (
        <div>
          <div className="text-3xl mb-2">🎉</div>
          <div className="text-xl font-bold">승리!</div>
          {monster && (
            <div
              className="text-sm mt-2"
              style={{ color: theme.colors.textMuted }}
            >
              +{monster.rewards.exp} EXP
              {monster.rewards.gold > 0 && ` · +${monster.rewards.gold} Gold`}
            </div>
          )}
        </div>
      )}
      {result === "defeat" && (
        <div>
          <div className="text-3xl mb-2">💀</div>
          <div className="text-xl font-bold">패배...</div>
        </div>
      )}
      {result === "fled" && (
        <div>
          <div className="text-3xl mb-2">🏃</div>
          <div className="text-xl font-bold">도주 성공!</div>
        </div>
      )}
    </div>
  );
}
