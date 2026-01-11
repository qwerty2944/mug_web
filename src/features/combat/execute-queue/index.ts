"use client";

import { useState, useCallback, useRef } from "react";
import { useBattleStore, type QueuedAction } from "@/application/stores";
import type { CharacterStats } from "@/entities/character";
import type { Proficiencies, CombatProficiencyType } from "@/entities/ability";
import { getProficiencyValue } from "@/entities/ability";
import type { RawMonsterAbility } from "@/entities/ability";
import { getEffectsAtLevel } from "@/entities/ability";
import {
  buildMonsterQueue,
  calculateMonsterAbilityDamage,
} from "../lib/monsterAi";
import { applyDamageVariance } from "../lib/damage";

// ============ 타입 정의 ============

interface UseExecuteQueueOptions {
  /** 플레이어 스탯 */
  characterStats: CharacterStats;
  /** 숙련도 정보 */
  proficiencies: Proficiencies | undefined;
  /** 몬스터 어빌리티 데이터 */
  monsterAbilitiesData: Map<string, RawMonsterAbility>;
  /** 행동 간 딜레이 (ms) */
  actionDelay?: number;
  /** 턴 종료 딜레이 (ms) */
  turnEndDelay?: number;
}

interface ExecuteQueueResult {
  success: boolean;
  message?: string;
}

/**
 * 큐 실행 훅
 * - 플레이어/몬스터 큐 교대 실행
 * - 몬스터 어빌리티 실행
 * - 턴 종료 처리
 */
export function useExecuteQueue(options: UseExecuteQueueOptions) {
  const {
    characterStats,
    proficiencies,
    monsterAbilitiesData,
    actionDelay = 600,
    turnEndDelay = 500,
  } = options;

  const [isExecuting, setIsExecuting] = useState(false);

  // Refs for stable values (avoid infinite loops)
  const characterStatsRef = useRef(characterStats);
  const proficienciesRef = useRef(proficiencies);
  const monsterAbilitiesDataRef = useRef(monsterAbilitiesData);

  // Update refs when values change
  characterStatsRef.current = characterStats;
  proficienciesRef.current = proficiencies;
  monsterAbilitiesDataRef.current = monsterAbilitiesData;

  /**
   * 큐 실행 (메인 함수)
   */
  const executeQueue = useCallback(async (): Promise<ExecuteQueueResult> => {
    // Get current state directly from store
    const store = useBattleStore.getState();
    const battle = store.battle;
    const playerQueue = battle.playerQueue;

    if (isExecuting || playerQueue.length === 0) {
      return { success: false, message: "실행할 수 없습니다" };
    }

    setIsExecuting(true);

    // 몬스터 큐 생성 (abilities가 없어도 기본 공격 사용)
    if (battle.monster) {
      const monsterQueue = buildMonsterQueue(
        {
          monster: battle.monster,
          monsterHpPercent: store.getMonsterHpPercent(),
          currentTurn: battle.turn,
          monsterMaxAp: battle.monsterMaxAp,
          monsterCurrentAp: battle.monsterCurrentAp,
        },
        monsterAbilitiesDataRef.current
      );
      store.setMonsterQueue(monsterQueue);
    }

    // 페이즈 변경
    store.executeQueues();

    // 실행 시점의 큐 복사
    const playerActions = [...playerQueue];
    const monsterActions = [...useBattleStore.getState().battle.monsterQueue];
    const isPlayerFirst = battle.playerGoesFirst;

    let playerIndex = 0;
    let monsterIndex = 0;

    /**
     * 플레이어 행동 실행
     */
    const executePlayerAction = (action: QueuedAction) => {
      const currentStore = useBattleStore.getState();
      const effects = getEffectsAtLevel(action.ability, action.level);
      const profLevel = action.ability.category
        ? getProficiencyValue(proficienciesRef.current, action.ability.category as CombatProficiencyType) || 0
        : 0;

      const stats = characterStatsRef.current;

      // 어빌리티 타입별 처리
      if (action.ability.type === "attack") {
        // 데미지 계산 (±15% 편차 적용)
        const baseDamage = effects.baseDamage ?? action.ability.baseCost.ap ?? 10;
        const rawDamage = baseDamage * (1 + profLevel * 0.02) * (1 + (stats.str || 10) * 0.05);
        const damage = applyDamageVariance(rawDamage);

        currentStore.dealDamageToMonster(
          damage,
          `${action.ability.icon ?? "⚔️"} ${action.ability.nameKo}! ${damage} 데미지!`,
          action.ability.category
        );
      } else if (action.ability.type === "heal") {
        const healAmount = effects.healAmount ?? 20;
        currentStore.healPlayer(healAmount);
        currentStore.addLog({
          turn: currentStore.battle.turn,
          actor: "player",
          action: "heal",
          message: `${action.ability.icon ?? "💚"} ${action.ability.nameKo}! HP ${healAmount} 회복!`,
        });
      } else if (action.ability.type === "buff") {
        currentStore.addLog({
          turn: currentStore.battle.turn,
          actor: "player",
          action: "buff",
          message: `${action.ability.icon ?? "✨"} ${action.ability.nameKo} 시전!`,
        });
      } else if (action.ability.type === "debuff") {
        currentStore.addLog({
          turn: currentStore.battle.turn,
          actor: "player",
          action: "debuff",
          message: `${action.ability.icon ?? "💀"} ${action.ability.nameKo} 시전!`,
        });
      } else if (action.ability.type === "defense") {
        // 방어 스킬별 효과 처리
        if (action.ability.id === "block") {
          // 막기: 다음 공격 데미지 감소
          const damageReduction = typeof effects.damageReduction === "number" ? effects.damageReduction : 25;
          currentStore.setDefensiveStance("guard", damageReduction);
          currentStore.addLog({
            turn: currentStore.battle.turn,
            actor: "player",
            action: "defense",
            message: `${action.ability.icon ?? "🛡️"} ${action.ability.nameKo}! 피해 ${damageReduction}% 감소!`,
          });
        } else if (action.ability.id === "dodge") {
          // 회피: 다음 공격 회피 시도
          const evasionChance = typeof effects.evasionChance === "number" ? effects.evasionChance : 70;
          currentStore.setDefensiveStance("dodge", evasionChance);
          currentStore.addLog({
            turn: currentStore.battle.turn,
            actor: "player",
            action: "defense",
            message: `${action.ability.icon ?? "💨"} ${action.ability.nameKo}! 회피 확률 ${evasionChance}%!`,
          });
        } else {
          // 기타 방어 스킬
          currentStore.addLog({
            turn: currentStore.battle.turn,
            actor: "player",
            action: "defense",
            message: `${action.ability.icon ?? "🛡️"} ${action.ability.nameKo} 자세!`,
          });
        }
      }

      // MP 소모
      if (action.mpCost > 0) {
        currentStore.useMp(action.mpCost);
      }
    };

    /**
     * 몬스터 행동 실행
     */
    const executeMonsterAction = (action: QueuedAction) => {
      const currentStore = useBattleStore.getState();
      const currentBattle = currentStore.battle;
      if (!currentBattle.monster) return;

      // 기본 공격인지 체크
      if (action.ability.id === "monster_basic_attack") {
        const damage = applyDamageVariance(currentBattle.monster.stats.attack * 0.8);
        currentStore.dealDamageToPlayer(
          damage,
          `${currentBattle.monster.icon} ${currentBattle.monster.nameKo}의 공격! ${damage} 데미지!`
        );
        return;
      }

      const abilityData = monsterAbilitiesDataRef.current.get(action.ability.id);
      if (!abilityData) {
        // 어빌리티 데이터가 없으면 기본 공격으로 처리
        const damage = applyDamageVariance(currentBattle.monster.stats.attack * 0.8);
        currentStore.dealDamageToPlayer(
          damage,
          `${currentBattle.monster.icon} ${currentBattle.monster.nameKo}의 공격! ${damage} 데미지!`
        );
        return;
      }

      // 어빌리티 타입별 처리
      if (abilityData.type === "attack") {
        const damage = calculateMonsterAbilityDamage(
          abilityData,
          action.level,
          currentBattle.monster.stats.attack
        );
        const message = `${abilityData.icon} ${currentBattle.monster.nameKo}의 ${abilityData.nameKo}! ${damage} 데미지!`;
        currentStore.dealDamageToPlayer(damage, message);

        // 상태이상 체크
        if (abilityData.statusChance && abilityData.statusEffect) {
          const roll = Math.random() * 100;
          if (roll < abilityData.statusChance) {
            currentStore.addLog({
              turn: currentBattle.turn,
              actor: "monster",
              action: "status",
              message: `💀 ${abilityData.statusEffect} 상태이상에 걸렸다!`,
            });
          }
        }
      } else if (abilityData.type === "buff" && abilityData.selfBuff) {
        currentStore.addLog({
          turn: currentBattle.turn,
          actor: "monster",
          action: "buff",
          message: `${abilityData.icon} ${currentBattle.monster.nameKo}이(가) ${abilityData.nameKo}!`,
        });
      } else if (abilityData.type === "debuff") {
        currentStore.addLog({
          turn: currentBattle.turn,
          actor: "monster",
          action: "debuff",
          message: `${abilityData.icon} ${currentBattle.monster.nameKo}이(가) ${abilityData.nameKo}!`,
        });
      }
    };

    return new Promise((resolve) => {
      // 턴 1: 선공자가 먼저 행동, 턴 2+: AP 비용이 작은 순으로 번갈아 실행
      const currentTurn = battle.turn;

      // 모든 행동을 하나의 배열로 합치고 정렬
      interface SortedAction {
        type: "player" | "monster";
        action: QueuedAction;
        apCost: number;
        originalIndex: number;
      }

      const sortedActions: SortedAction[] = [];

      playerActions.forEach((action, idx) => {
        sortedActions.push({
          type: "player",
          action,
          apCost: action.apCost,
          originalIndex: idx,
        });
      });

      monsterActions.forEach((action, idx) => {
        sortedActions.push({
          type: "monster",
          action,
          apCost: action.apCost,
          originalIndex: idx,
        });
      });

      // 턴 1: 선공자의 모든 행동 → 후공자의 모든 행동
      // 턴 2+: AP 비용 순으로 정렬 (같으면 선공자 우선)
      if (currentTurn === 1) {
        // 턴 1: 선공자 먼저
        sortedActions.sort((a, b) => {
          const aFirst = (a.type === "player") === isPlayerFirst;
          const bFirst = (b.type === "player") === isPlayerFirst;
          if (aFirst !== bFirst) return aFirst ? -1 : 1;
          return a.originalIndex - b.originalIndex;
        });
      } else {
        // 턴 2+: AP 비용 순으로 정렬 (작은 AP가 먼저), 같으면 player/monster 번갈아
        sortedActions.sort((a, b) => {
          if (a.apCost !== b.apCost) return a.apCost - b.apCost;
          // AP 같으면 선공자 우선
          const aFirst = (a.type === "player") === isPlayerFirst;
          const bFirst = (b.type === "player") === isPlayerFirst;
          if (aFirst !== bFirst) return aFirst ? -1 : 1;
          return a.originalIndex - b.originalIndex;
        });
      }

      let actionIndex = 0;

      const executeNextAction = () => {
        // 전투 종료 체크
        const currentBattle = useBattleStore.getState().battle;
        if (currentBattle.result !== "ongoing") {
          setIsExecuting(false);
          resolve({ success: true, message: "전투 종료" });
          return;
        }

        if (actionIndex < sortedActions.length) {
          const sortedAction = sortedActions[actionIndex];

          if (sortedAction.type === "player") {
            executePlayerAction(sortedAction.action);
          } else {
            executeMonsterAction(sortedAction.action);
          }

          actionIndex++;
          setTimeout(executeNextAction, actionDelay);
        } else {
          // 모든 행동 완료 → 다음 턴
          setTimeout(() => {
            const finalBattle = useBattleStore.getState().battle;
            if (finalBattle.result === "ongoing") {
              useBattleStore.getState().startNextTurn();
            }
            setIsExecuting(false);
            resolve({ success: true, message: "턴 완료" });
          }, turnEndDelay);
        }
      };

      // 실행 시작
      setTimeout(executeNextAction, 300);
    });
  }, [isExecuting, actionDelay, turnEndDelay]);

  // playerQueue length for canExecute check
  const playerQueueLength = useBattleStore((state) => state.battle.playerQueue.length);

  return {
    /** 큐 실행 */
    executeQueue,
    /** 실행 중 여부 */
    isExecuting,
    /** 실행 가능 여부 */
    canExecute: !isExecuting && playerQueueLength > 0,
  };
}
