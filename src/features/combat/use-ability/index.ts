"use client";

import { useCallback } from "react";
import { useBattleStore } from "@/application/stores";
import type { Ability, AbilityLevelEffects } from "@/entities/ability";
import { getApCost, getMpCost, getEffectsAtLevel } from "@/entities/ability";
import type { CharacterStats } from "@/entities/character";
import type { CombatProficiencyType, MagicElement, WeaponType } from "@/entities/ability";
import { isWeaponProficiency, WEAPON_ATTACK_TYPE } from "@/entities/ability";
import { getPhysicalResistance } from "@/entities/monster";
import type { StatusType } from "@/entities/status";
import type { Period } from "@/entities/game-time";
import type { WeatherType } from "@/entities/weather";
import {
  calculatePhysicalDamage,
  calculateMagicDamage,
  calculateMonsterDamage,
  determineHitResult,
} from "../lib/damage";
import {
  getAttackMessage,
  getMonsterAttackMessage,
  getDodgeMessage,
  getBlockMessage,
  getMissMessage,
  getPlayerDodgeMessage,
  getPlayerBlockMessage,
  getMonsterMissMessage,
} from "../lib/messages";

// ============ 타입 정의 ============

interface UseAbilityOptions {
  onQueueFull?: () => void;
  onMpInsufficient?: () => void;
}

interface QueueAbilityParams {
  ability: Ability;
  abilityLevel: number;
}

interface ExecuteAbilityParams {
  ability: Ability;
  abilityLevel: number;
  effects: AbilityLevelEffects;
  casterStats: CharacterStats;
  proficiencyLevel: number;
  playerDefense?: number;
  period?: Period;
  weather?: WeatherType;
  karma?: number;
}

interface ExecuteAbilityResult {
  success: boolean;
  damage?: number;
  heal?: number;
  isCritical?: boolean;
  hitResult?: string;
  message: string;
}

/**
 * 어빌리티 사용 훅
 * - 큐에 어빌리티 추가
 * - 어빌리티 실행 (데미지/힐/버프/디버프)
 */
export function useAbility(options: UseAbilityOptions = {}) {
  const {
    battle,
    addToPlayerQueue,
    removeFromPlayerQueue,
    clearPlayerQueue,
    dealDamageToMonster,
    dealDamageToPlayer,
    healPlayer,
    useMp,
    applyPlayerStatus,
    applyMonsterStatus,
    addLog,
    canAffordAp,
    getRemainingPlayerAp,
    getPlayerMagicModifier,
  } = useBattleStore();

  const { onQueueFull, onMpInsufficient } = options;

  /**
   * 어빌리티를 큐에 추가
   */
  const queueAbility = useCallback(
    (params: QueueAbilityParams): boolean => {
      const { ability, abilityLevel } = params;

      // 비용 계산
      const apCost = getApCost(ability, abilityLevel);
      const mpCost = getMpCost(ability, abilityLevel);

      // AP 체크
      if (!canAffordAp(apCost)) {
        onQueueFull?.();
        addLog({
          turn: battle.turn,
          actor: "system",
          action: "ap_fail",
          message: `AP가 부족합니다! (필요: ${apCost}, 남음: ${getRemainingPlayerAp()})`,
        });
        return false;
      }

      // MP 체크
      if (mpCost > battle.playerMp) {
        onMpInsufficient?.();
        addLog({
          turn: battle.turn,
          actor: "system",
          action: "mp_fail",
          message: `MP가 부족합니다! (필요: ${mpCost}, 현재: ${battle.playerMp})`,
        });
        return false;
      }

      // 큐에 추가
      const success = addToPlayerQueue({
        ability,
        level: abilityLevel,
        apCost,
        mpCost,
      });

      if (success) {
        addLog({
          turn: battle.turn,
          actor: "player",
          action: "queue",
          message: `${ability.icon ?? "⚔️"} ${ability.nameKo}을(를) 준비했다. (AP: ${apCost})`,
        });
      }

      return success;
    },
    [battle, addToPlayerQueue, canAffordAp, getRemainingPlayerAp, addLog, onQueueFull, onMpInsufficient]
  );

  /**
   * 어빌리티 실행 (큐 처리 시 호출)
   */
  const executeAbility = useCallback(
    (params: ExecuteAbilityParams): ExecuteAbilityResult => {
      const {
        ability,
        abilityLevel,
        effects,
        casterStats,
        proficiencyLevel,
        playerDefense = 0,
        period,
        weather,
        karma,
      } = params;

      // MP 소모
      const mpCost = getMpCost(ability, abilityLevel);
      if (mpCost > 0) {
        if (!useMp(mpCost)) {
          return { success: false, message: "MP 부족" };
        }
      }

      // 어빌리티 타입별 처리
      switch (ability.type) {
        case "attack":
          return executeAttack({
            ability,
            effects,
            casterStats,
            proficiencyLevel,
            period,
            weather,
            karma,
          });

        case "heal":
          return executeHeal({ ability, effects });

        case "buff":
          return executeBuff({ ability, effects });

        case "debuff":
          return executeDebuff({ ability, effects });

        case "defense":
          return executeDefense({ ability, effects });

        default:
          addLog({
            turn: battle.turn,
            actor: "player",
            action: "skill",
            message: `${ability.icon ?? "✨"} ${ability.nameKo} 사용!`,
          });
          return { success: true, message: ability.nameKo };
      }
    },
    [battle, useMp, addLog]
  );

  /**
   * 공격 어빌리티 실행
   */
  const executeAttack = useCallback(
    (params: {
      ability: Ability;
      effects: AbilityLevelEffects;
      casterStats: CharacterStats;
      proficiencyLevel: number;
      period?: Period;
      weather?: WeatherType;
      karma?: number;
    }): ExecuteAbilityResult => {
      const { ability, effects, casterStats, proficiencyLevel, period, weather, karma } = params;

      if (!battle.monster) {
        return { success: false, message: "대상이 없습니다" };
      }

      const isPhysical = ability.attackType === "melee_physical" || ability.attackType === "ranged_physical";
      const baseDamage = effects.baseDamage ?? ability.baseCost.ap ?? 10;

      // 공격 판정
      const hitResult = determineHitResult(
        { lck: casterStats.lck ?? 10, dex: casterStats.dex, int: casterStats.int },
        { dex: battle.monster.stats.speed ?? 5, con: Math.floor(battle.monster.stats.defense / 2) },
        isPhysical
      );

      let damage = 0;
      let message = "";
      const isCritical = hitResult.result === "critical";

      // 저항 배율 (물리 공격용)
      let resistanceMultiplier = 1.0;

      if (hitResult.result === "missed") {
        message = getMissMessage(battle.monster.nameKo);
      } else if (hitResult.result === "dodged") {
        message = getDodgeMessage(battle.monster.nameKo);
      } else {
        // 데미지 계산
        if (isPhysical) {
          // 물리 저항 확인
          if (ability.category && isWeaponProficiency(ability.category as CombatProficiencyType)) {
            const weaponType = ability.category as WeaponType;
            const physicalAttackType = WEAPON_ATTACK_TYPE[weaponType];
            if (physicalAttackType) {
              resistanceMultiplier = getPhysicalResistance(battle.monster.stats, physicalAttackType);
            }
          }

          damage = calculatePhysicalDamage({
            baseDamage,
            attackerStr: casterStats.str,
            weaponType: (ability.category as WeaponType) || "fist",
            proficiencyLevel,
            targetDefense: battle.monster.stats.defense,
            attackTypeResistance: resistanceMultiplier,
          });
        } else {
          // 마법 공격
          const magicModifier = getPlayerMagicModifier();
          damage = calculateMagicDamage({
            baseDamage,
            attackerInt: casterStats.int,
            element: ability.element as MagicElement,
            proficiencyLevel,
            targetDefense: battle.monster.stats.defense,
            targetElement: battle.monster.element,
            period,
            weather,
            karma,
          });

          // 마법 버프 적용
          if (magicModifier !== 0) {
            damage = Math.floor(damage * (1 + magicModifier / 100));
          }
        }

        // 배율 적용
        damage = Math.floor(damage * hitResult.damageMultiplier);
        const isMinDamage = damage === 1;
        damage = Math.max(1, damage);

        // 메시지 생성 (저항 피드백 포함)
        if (hitResult.result === "blocked") {
          message = getBlockMessage(battle.monster.nameKo, damage);
        } else {
          // 물리 공격: 저항 피드백 메시지 추가
          if (isPhysical && ability.category) {
            message = getAttackMessage(
              ability.category as CombatProficiencyType,
              battle.monster.nameKo,
              damage,
              isCritical,
              resistanceMultiplier,
              isMinDamage
            );
          } else {
            const icon = ability.icon ?? (isPhysical ? "⚔️" : "✨");
            message = isCritical
              ? `💥 ${ability.nameKo} 치명타! ${battle.monster.nameKo}에게 ${damage} 데미지!`
              : `${icon} ${ability.nameKo}! ${battle.monster.nameKo}에게 ${damage} 데미지!`;
          }
        }
      }

      // 데미지 적용
      if (damage > 0) {
        dealDamageToMonster(damage, message, ability.category);
      } else {
        addLog({
          turn: battle.turn,
          actor: "player",
          action: "attack",
          message,
        });
      }

      // 상태이상 부여 (명중 시에만)
      if (damage > 0 && effects.statusEffect && effects.statusChance) {
        const roll = Math.random() * 100;
        if (roll < effects.statusChance) {
          applyMonsterStatus(
            effects.statusEffect as StatusType,
            effects.statusValue ?? 0,
            effects.statusDuration
          );
        }
      }

      return {
        success: true,
        damage,
        isCritical,
        hitResult: hitResult.result,
        message,
      };
    },
    [battle, dealDamageToMonster, applyMonsterStatus, addLog, getPlayerMagicModifier]
  );

  /**
   * 치유 어빌리티 실행
   */
  const executeHeal = useCallback(
    (params: { ability: Ability; effects: AbilityLevelEffects }): ExecuteAbilityResult => {
      const { ability, effects } = params;

      const healAmount = effects.healAmount ?? 0;
      const healPercent = effects.healPercent ?? 0;

      let totalHeal = healAmount;
      if (healPercent > 0) {
        totalHeal += Math.floor(battle.playerMaxHp * (healPercent / 100));
      }

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "skill",
        message: `${ability.icon ?? "💚"} ${ability.nameKo} 시전!`,
      });

      healPlayer(totalHeal);

      return {
        success: true,
        heal: totalHeal,
        message: `HP ${totalHeal} 회복!`,
      };
    },
    [battle, healPlayer, addLog]
  );

  /**
   * 버프 어빌리티 실행
   */
  const executeBuff = useCallback(
    (params: { ability: Ability; effects: AbilityLevelEffects }): ExecuteAbilityResult => {
      const { ability, effects } = params;

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "skill",
        message: `${ability.icon ?? "🛡️"} ${ability.nameKo} 시전!`,
      });

      if (effects.statusEffect) {
        applyPlayerStatus(
          effects.statusEffect as StatusType,
          effects.statusValue ?? 0,
          effects.statusDuration
        );
      }

      return {
        success: true,
        message: `${ability.nameKo} 효과 적용!`,
      };
    },
    [battle, applyPlayerStatus, addLog]
  );

  /**
   * 디버프 어빌리티 실행
   */
  const executeDebuff = useCallback(
    (params: { ability: Ability; effects: AbilityLevelEffects }): ExecuteAbilityResult => {
      const { ability, effects } = params;

      if (!battle.monster) {
        return { success: false, message: "대상이 없습니다" };
      }

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "skill",
        message: `${ability.icon ?? "💀"} ${ability.nameKo} 시전!`,
      });

      if (effects.statusEffect) {
        applyMonsterStatus(
          effects.statusEffect as StatusType,
          effects.statusValue ?? 0,
          effects.statusDuration
        );
      }

      return {
        success: true,
        message: `${battle.monster.nameKo}에게 ${ability.nameKo} 적용!`,
      };
    },
    [battle, applyMonsterStatus, addLog]
  );

  /**
   * 방어 어빌리티 실행
   */
  const executeDefense = useCallback(
    (params: { ability: Ability; effects: AbilityLevelEffects }): ExecuteAbilityResult => {
      const { ability, effects } = params;
      const { setDefensiveStance } = useBattleStore.getState();

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "skill",
        message: `${ability.icon ?? "🛡️"} ${ability.nameKo} 자세!`,
      });

      // 방어 자세 설정
      if (effects.blockBonus) {
        setDefensiveStance("guard", effects.blockBonus);
      } else if (effects.dodgeBonus) {
        setDefensiveStance("dodge", effects.dodgeBonus);
      } else if (effects.counterChance) {
        setDefensiveStance("counter", effects.counterChance);
      }

      return {
        success: true,
        message: `${ability.nameKo} 자세 취함!`,
      };
    },
    [battle, addLog]
  );

  /**
   * 큐에서 어빌리티 제거
   */
  const unqueueAbility = useCallback(
    (index: number) => {
      const action = battle.playerQueue[index];
      if (action) {
        removeFromPlayerQueue(index);
        addLog({
          turn: battle.turn,
          actor: "player",
          action: "unqueue",
          message: `${action.ability.icon ?? "⚔️"} ${action.ability.nameKo}을(를) 취소했다.`,
        });
      }
    },
    [battle, removeFromPlayerQueue, addLog]
  );

  /**
   * 큐 초기화
   */
  const clearQueue = useCallback(() => {
    clearPlayerQueue();
    addLog({
      turn: battle.turn,
      actor: "player",
      action: "clear_queue",
      message: "모든 행동을 취소했다.",
    });
  }, [clearPlayerQueue, addLog, battle.turn]);

  return {
    // 큐 조작
    queueAbility,
    unqueueAbility,
    clearQueue,

    // 실행
    executeAbility,

    // 상태
    playerQueue: battle.playerQueue,
    remainingAp: getRemainingPlayerAp(),
    maxAp: battle.playerMaxAp,
    playerMp: battle.playerMp,
    playerMaxMp: battle.playerMaxMp,

    // 체크
    canAffordAp,
    canAffordMp: (mp: number) => battle.playerMp >= mp,
    isInBattle: battle.isInBattle,
    isPlanning: battle.phase === "planning",
  };
}
