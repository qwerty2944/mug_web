"use client";

import { useState, useEffect, useCallback } from "react";
import { useBattleStore } from "@/application/stores";
import { useThemeStore } from "@/shared/config";
import type { CharacterStats } from "@/entities/character";
import type { ProficiencyType, CombatProficiencyType, Proficiencies } from "@/entities/proficiency";
import { getProficiencyValue } from "@/entities/proficiency";
import type { Skill } from "@/entities/skill";
import { useAttack, useCastSpell, calculateMonsterDamage, usePassiveSkills } from "@/features/combat";
import { BattleHeader } from "./battle/BattleHeader";
import { BattleLog } from "./battle/BattleLog";
import { ActionTabs, type BattleActionTab } from "./battle/ActionTabs";
import { ActionPanel, type DefenseAction } from "./battle/ActionPanel";

interface BattlePanelProps {
  characterStats: CharacterStats;
  proficiencies: Proficiencies | undefined;
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
    setDefensiveStance,
    clearDefensiveStance,
    addLog,
  } = useBattleStore();

  const [activeTab, setActiveTab] = useState<BattleActionTab>("weapon");
  const [isProcessing, setIsProcessing] = useState(false); // 공격 처리 중 연타 방지

  // 패시브 스킬 훅
  const { processOnHit, hasPassiveSkills } = usePassiveSkills({
    characterStats,
  });

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

    // 피격 시 패시브 스킬 발동
    if (damage > 0 && hasPassiveSkills) {
      setTimeout(() => {
        processOnHit(damage);
      }, 100);
    }
  }, [
    battle,
    characterStats,
    getPlayerDefModifier,
    getMonsterAtkModifier,
    monsterAttack,
    hasPassiveSkills,
    processOnHit,
  ]);

  // 무기 공격 (useAttack이 내부적으로 몬스터 반격 처리)
  const { attack: performWeaponAttack } = useAttack();

  // 마법 시전
  const { castSpell } = useCastSpell({
    onMonsterTurn: handleMonsterTurn,
  });

  // 무기 공격 핸들러
  const handleWeaponAttack = useCallback(
    (weaponType: CombatProficiencyType) => {
      if (isPlayerIncapacitated() || isProcessing) {
        return;
      }

      // 연타 방지: 공격 시작 시 처리 중 상태로 전환
      setIsProcessing(true);

      const stats = characterStats;
      const profLevel = getProficiencyValue(proficiencies, weaponType);

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

      // 몬스터 반격 딜레이(500ms) + 여유시간 후 버튼 다시 활성화
      setTimeout(() => {
        setIsProcessing(false);
      }, 700);
    },
    [
      characterStats,
      proficiencies,
      performWeaponAttack,
      processStatusEffects,
      tickAllStatuses,
      isPlayerIncapacitated,
      isProcessing,
      battle.turn,
    ]
  );

  // 스킬 시전 핸들러
  const handleCastSkill = useCallback(
    (skill: Skill) => {
      if (isPlayerIncapacitated() || isProcessing) {
        return;
      }

      // 연타 방지
      setIsProcessing(true);

      // 상태이상 처리 (턴 시작)
      processStatusEffects();

      const profLevel = skill.proficiencyType
        ? getProficiencyValue(proficiencies, skill.proficiencyType as ProficiencyType)
        : 0;

      castSpell({
        skill,
        casterStats: characterStats,
        proficiencyLevel: profLevel,
      });

      // 상태이상 지속시간 감소
      tickAllStatuses();

      // 몬스터 반격 딜레이 후 버튼 다시 활성화
      setTimeout(() => {
        setIsProcessing(false);
      }, 700);
    },
    [
      characterStats,
      proficiencies,
      castSpell,
      processStatusEffects,
      tickAllStatuses,
      isPlayerIncapacitated,
      isProcessing,
    ]
  );

  // 방어 행동 핸들러
  const handleDefenseAction = useCallback(
    (action: DefenseAction) => {
      if (isPlayerIncapacitated() || isProcessing) {
        return;
      }

      setIsProcessing(true);

      // 상태이상 처리 (턴 시작)
      processStatusEffects();

      // 방어 자세 설정 및 로그
      let stanceMessage = "";
      let stanceValue = 0;
      switch (action) {
        case "guard":
          stanceValue = 50; // 50% 피해 감소
          stanceMessage = "🛡️ 방어 자세를 취했다! (피해 50% 감소)";
          break;
        case "dodge":
          stanceValue = 40; // 40% 회피 확률 증가
          stanceMessage = "💨 회피에 집중한다! (회피 +40%)";
          break;
        case "counter":
          stanceValue = 100; // 100% 반격 확률
          stanceMessage = "⚡ 반격을 준비한다! (막기 성공 시 반격)";
          break;
      }

      setDefensiveStance(action, stanceValue);
      addLog({
        turn: battle.turn,
        actor: "player",
        action: "defense",
        message: stanceMessage,
      });

      // 상태이상 지속시간 감소
      tickAllStatuses();

      // 몬스터 턴
      setTimeout(() => {
        // 방어 자세 효과 적용 후 몬스터 공격
        handleMonsterTurnWithDefense(action, stanceValue);
        // 방어 자세 초기화 (1턴만 유지)
        clearDefensiveStance();
        setIsProcessing(false);
      }, 500);
    },
    [
      isPlayerIncapacitated,
      isProcessing,
      processStatusEffects,
      tickAllStatuses,
      setDefensiveStance,
      clearDefensiveStance,
      addLog,
      battle.turn,
    ]
  );

  // 방어 자세 적용된 몬스터 턴
  const handleMonsterTurnWithDefense = useCallback(
    (stance: DefenseAction, stanceValue: number) => {
      if (!battle.monster || battle.result !== "ongoing") return;
      if (battle.monster.behavior === "passive") return;

      const defModifier = getPlayerDefModifier();
      const baseDefense = Math.floor((characterStats.con || 10) * 0.5);
      const finalDefense = Math.max(0, baseDefense + defModifier);

      const atkModifier = getMonsterAtkModifier();
      const monsterAtk = Math.max(
        1,
        battle.monster.stats.attack * (1 + atkModifier / 100)
      );

      let damage = calculateMonsterDamage(monsterAtk, finalDefense);

      // 방어 자세에 따른 효과 적용
      if (stance === "guard") {
        // 피해 50% 감소
        damage = Math.floor(damage * 0.5);
        addLog({
          turn: battle.turn,
          actor: "system",
          action: "guard_success",
          message: "🛡️ 방어 자세로 피해를 줄였다!",
        });
      } else if (stance === "dodge") {
        // 회피 판정 (기본 DEX 회피 + 40%)
        const baseDodge = Math.min(30, (characterStats.dex || 10) * 0.5);
        const totalDodgeChance = baseDodge + stanceValue;
        if (Math.random() * 100 < totalDodgeChance) {
          addLog({
            turn: battle.turn,
            actor: "player",
            action: "dodge_success",
            message: "💨 공격을 회피했다!",
          });
          return; // 공격 회피
        }
      } else if (stance === "counter") {
        // 막기 판정 후 반격
        const blockChance = Math.min(40, (characterStats.con || 10) * 0.8);
        if (Math.random() * 100 < blockChance) {
          damage = Math.floor(damage * 0.5); // 막기 성공 시 피해 반감
          addLog({
            turn: battle.turn,
            actor: "player",
            action: "block_counter",
            message: "⚡ 공격을 막고 반격을 가한다!",
          });
          // 반격 데미지 (플레이어 공격력의 50%)
          const counterDamage = Math.floor((characterStats.str || 10) * 1.5);
          setTimeout(() => {
            const { battle: currentBattle, playerAttack } = useBattleStore.getState();
            if (currentBattle.monster && currentBattle.result === "ongoing") {
              playerAttack(
                counterDamage,
                `⚡ 반격! ${counterDamage} 데미지!`
              );
            }
          }, 300);
        }
      }

      const message = `${battle.monster.icon} ${battle.monster.nameKo}의 공격! ${damage} 데미지!`;
      monsterAttack(damage, message);

      // 피격 시 패시브 스킬 발동
      if (damage > 0 && hasPassiveSkills) {
        setTimeout(() => {
          processOnHit(damage);
        }, 100);
      }
    },
    [
      battle,
      characterStats,
      getPlayerDefModifier,
      getMonsterAtkModifier,
      monsterAttack,
      addLog,
      hasPassiveSkills,
      processOnHit,
    ]
  );

  // 도주 핸들러
  const handleFlee = useCallback(() => {
    if (isProcessing) return;

    setIsProcessing(true);
    const success = playerFlee();
    if (success) {
      onFlee();
    } else {
      // 도주 실패 시 몬스터 턴
      setTimeout(() => {
        handleMonsterTurn();
        setIsProcessing(false);
      }, 500);
    }
  }, [playerFlee, onFlee, handleMonsterTurn, isProcessing]);

  // 전투 종료 처리 (수동 닫기)
  const handleCloseBattle = useCallback(() => {
    const currentResult = useBattleStore.getState().battle.result;
    if (currentResult === "victory") {
      onVictory();
    } else if (currentResult === "defeat") {
      onDefeat();
    } else if (currentResult === "fled") {
      resetBattle();
    }
  }, [onVictory, onDefeat, resetBattle]);

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
              disabled={isIncapacitated || isProcessing}
            />

            {/* 액션 패널 */}
            <ActionPanel
              activeTab={activeTab}
              proficiencies={proficiencies}
              onWeaponAttack={handleWeaponAttack}
              onDefenseAction={handleDefenseAction}
              onCastSkill={handleCastSkill}
              onFlee={handleFlee}
              disabled={isIncapacitated || isProcessing}
            />
          </>
        ) : (
          <BattleResult
            result={battle.result}
            monster={battle.monster}
            onClose={handleCloseBattle}
          />
        )}
      </div>
    </div>
  );
}

// 전투 결과 컴포넌트
interface BattleResultProps {
  result: "victory" | "defeat" | "fled" | "ongoing";
  monster: { nameKo: string; rewards: { exp: number; gold: number } } | null;
  onClose: () => void;
}

function BattleResult({ result, monster, onClose }: BattleResultProps) {
  const { theme } = useThemeStore();

  return (
    <div className="text-center py-6 font-mono">
      <div
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

      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="mt-4 px-6 py-2 font-mono text-sm transition-colors"
        style={{
          background: theme.colors.bgLight,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.text,
        }}
      >
        닫기
      </button>
    </div>
  );
}
