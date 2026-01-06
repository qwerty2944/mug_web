"use client";

import { useCallback } from "react";
import { useBattleStore } from "@/application/stores";
import type { CharacterStats } from "@/entities/character";
import type { ProficiencyType, MagicElement } from "@/entities/proficiency";
import { getProficiencyInfo, isWeaponProficiency } from "@/entities/proficiency";
import { canMonsterAttack } from "@/entities/monster";
import {
  calculateDamage,
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

interface AttackOptions {
  attackType: ProficiencyType;
  proficiencyLevel: number;
  attackerStats: CharacterStats;
  baseDamage?: number;
  playerDefense?: number;
}

/**
 * 공격 액션 훅
 */
export function useAttack() {
  const { battle, playerAttack, monsterAttack, addLog } = useBattleStore();

  const attack = useCallback(
    (options: AttackOptions) => {
      if (!battle.isInBattle || battle.result !== "ongoing" || !battle.monster) {
        console.warn("Cannot attack: not in battle or battle ended");
        return null;
      }

      const { attackType, proficiencyLevel, attackerStats, baseDamage = 10, playerDefense = 0 } = options;
      const isPhysical = isWeaponProficiency(attackType);

      // 플레이어 공격 판정 (빗맞음 → 회피 → 막기 → 치명타 → 명중)
      const hitResult = determineHitResult(
        { lck: attackerStats.lck ?? 10, dex: attackerStats.dex, int: attackerStats.int },
        { dex: battle.monster.stats.speed ?? 5, con: Math.floor(battle.monster.stats.defense / 2) },
        isPhysical
      );

      let damage = 0;
      let message = "";
      const isCritical = hitResult.result === "critical";

      if (hitResult.result === "missed") {
        // 빗맞음 - 데미지 0
        message = getMissMessage(battle.monster.nameKo);
      } else if (hitResult.result === "dodged") {
        // 회피 - 데미지 0
        message = getDodgeMessage(battle.monster.nameKo);
      } else {
        // 명중/치명타/막기 - 데미지 계산
        damage = calculateDamage({
          baseDamage,
          attackerStats,
          attackType,
          proficiencyLevel,
          targetDefense: battle.monster.stats.defense,
          targetElement: battle.monster.element,
        });

        // 배율 적용 (치명타 or 막기)
        damage = Math.floor(damage * hitResult.damageMultiplier);
        damage = Math.max(1, damage);

        if (hitResult.result === "blocked") {
          const reducedDamage = Math.floor(damage); // 이미 50% 적용됨
          message = getBlockMessage(battle.monster.nameKo, reducedDamage);
        } else {
          // hit or critical
          message = getAttackMessage(attackType, battle.monster.nameKo, damage, isCritical);
        }
      }

      // 플레이어 공격 적용
      playerAttack(damage, message, attackType);

      // 결과 확인 (몬스터가 아직 살아있으면 반격)
      const newMonsterHp = battle.monsterCurrentHp - damage;
      if (newMonsterHp > 0 && canMonsterAttack(battle.monster)) {
        // 몬스터 반격 판정
        const monsterHitResult = determineHitResult(
          { lck: 5 }, // 몬스터 기본 LCK
          { dex: attackerStats.dex ?? 10, con: attackerStats.con ?? 10 },
          true // 물리 공격
        );

        let monsterDamage = 0;
        let monsterMessage = "";

        if (monsterHitResult.result === "missed") {
          // 몬스터 공격 빗맞음
          monsterMessage = getMonsterMissMessage();
        } else if (monsterHitResult.result === "dodged") {
          // 플레이어 회피
          monsterMessage = getPlayerDodgeMessage();
        } else {
          // 명중/치명타/막기
          monsterDamage = calculateMonsterDamage(battle.monster.stats.attack, playerDefense);
          monsterDamage = Math.floor(monsterDamage * monsterHitResult.damageMultiplier);
          monsterDamage = Math.max(0, monsterDamage);

          if (monsterHitResult.result === "blocked") {
            const reducedAmount = Math.floor(monsterDamage / 2); // 감소량
            monsterMessage = getPlayerBlockMessage(reducedAmount);
          } else {
            monsterMessage = getMonsterAttackMessage(battle.monster.nameKo, monsterDamage);
          }
        }

        // 약간의 딜레이 후 몬스터 공격 (UI 애니메이션용)
        setTimeout(() => {
          monsterAttack(monsterDamage, monsterMessage);
        }, 500);
      }

      return {
        damage,
        isCritical,
        hitResult: hitResult.result,
        attackType,
      };
    },
    [battle, playerAttack, monsterAttack, addLog]
  );

  return {
    attack,
    isInBattle: battle.isInBattle,
    canAttack: battle.isInBattle && battle.result === "ongoing",
  };
}
