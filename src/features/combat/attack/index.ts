"use client";

import { useCallback } from "react";
import { useBattleStore } from "@/application/stores";
import type { CharacterStats } from "@/entities/character";
import type { ProficiencyType, MagicElement } from "@/entities/proficiency";
import { getProficiencyInfo } from "@/entities/proficiency";
import { canMonsterAttack } from "@/entities/monster";
import { calculateDamage, calculateMonsterDamage, applyCritical } from "../lib/damage";

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

      // 공격 정보 가져오기
      const proficiencyInfo = getProficiencyInfo(attackType);
      const attackName = proficiencyInfo?.nameKo || attackType;

      // 데미지 계산
      let damage = calculateDamage({
        baseDamage,
        attackerStats,
        attackType,
        proficiencyLevel,
        targetDefense: battle.monster.stats.defense,
        targetElement: battle.monster.element,
      });

      // 크리티컬 히트 체크
      const { damage: finalDamage, isCritical } = applyCritical(damage, attackerStats.dex);
      damage = finalDamage;

      // 메시지 생성
      let message = `${attackName}(으)로 ${battle.monster.nameKo}에게 ${damage} 데미지!`;
      if (isCritical) {
        message = `치명타! ${message}`;
      }

      // 플레이어 공격 적용
      playerAttack(damage, message, attackType);

      // 결과 확인 (몬스터가 아직 살아있으면 반격)
      const newMonsterHp = battle.monsterCurrentHp - damage;
      if (newMonsterHp > 0 && canMonsterAttack(battle.monster)) {
        // 몬스터 반격
        const monsterDamage = calculateMonsterDamage(battle.monster.stats.attack, playerDefense);

        if (monsterDamage > 0) {
          const monsterMessage = `${battle.monster.nameKo}의 반격! ${monsterDamage} 데미지를 받았다.`;
          // 약간의 딜레이 후 몬스터 공격 (UI 애니메이션용)
          setTimeout(() => {
            monsterAttack(monsterDamage, monsterMessage);
          }, 500);
        }
      }

      return {
        damage,
        isCritical,
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
