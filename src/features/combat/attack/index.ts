"use client";

import { useCallback } from "react";
import { useBattleStore } from "@/application/stores";
import type { CharacterStats } from "@/entities/character";
import type { CombatProficiencyType, MagicElement } from "@/entities/proficiency";
import { getProficiencyInfo, isWeaponProficiency, WEAPON_ATTACK_TYPE, type WeaponType } from "@/entities/proficiency";
import { canMonsterAttack, getPhysicalResistance } from "@/entities/monster";
import {
  calculateDamage,
  calculatePhysicalDamage,
  calculateMonsterDamage,
  determineHitResult,
  determineHitResultEx,
  calculateCounterDamage,
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
  getPlayerWeaponBlockMessage,
  getCounterDamageMessage,
} from "../lib/messages";

interface AttackOptions {
  attackType: CombatProficiencyType;
  proficiencyLevel: number;
  attackerStats: CharacterStats;
  baseDamage?: number;
  playerDefense?: number;
  // 신규 전투 스탯 (선택적 - 제공 시 적용)
  physicalPenetration?: number;    // 물리관통 %
  magicPenetration?: number;       // 마법관통 %
  bonusDodge?: number;             // 추가 회피 확률
  bonusBlock?: number;             // 추가 막기 확률
  // 무기막기 설정 (선택적)
  defenderWeaponType?: WeaponType; // 플레이어 장착 무기
  defenderWeaponProficiency?: number; // 플레이어 무기 숙련도
  bonusWeaponBlock?: number;       // 추가 무기막기 확률
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

      const {
        attackType,
        proficiencyLevel,
        attackerStats,
        baseDamage = 10,
        playerDefense = 0,
        // 신규 전투 스탯
        physicalPenetration = 0,
        magicPenetration = 0,
        bonusDodge = 0,
        bonusBlock = 0,
        defenderWeaponType,
        defenderWeaponProficiency = 0,
        bonusWeaponBlock = 0,
      } = options;
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
        // 물리 공격인 경우 몬스터 물리 저항 적용
        let resistanceMultiplier = 1.0;
        if (isPhysical) {
          const weaponType = attackType as WeaponType;
          const physicalAttackType = WEAPON_ATTACK_TYPE[weaponType];
          resistanceMultiplier = getPhysicalResistance(battle.monster.stats, physicalAttackType);
        }

        // 명중/치명타/막기 - 데미지 계산
        if (isPhysical) {
          // 물리 공격: 저항 배율 + 관통 적용
          damage = calculatePhysicalDamage({
            baseDamage,
            attackerStr: attackerStats.str,
            weaponType: attackType as WeaponType,
            proficiencyLevel,
            targetDefense: battle.monster.stats.defense,
            attackTypeResistance: resistanceMultiplier,
            attackerPhysicalPenetration: physicalPenetration,
          });
        } else {
          // 마법 공격: 관통 적용은 calculateMagicDamage에서 별도 처리 필요 시 추가
          damage = calculateDamage({
            baseDamage,
            attackerStats,
            attackType,
            proficiencyLevel,
            targetDefense: battle.monster.stats.defense,
            targetElement: battle.monster.element,
          });
        }

        // 배율 적용 (치명타 or 막기)
        damage = Math.floor(damage * hitResult.damageMultiplier);
        const isMinDamage = damage <= 1;
        damage = Math.max(1, damage);

        if (hitResult.result === "blocked") {
          const reducedDamage = Math.floor(damage); // 이미 50% 적용됨
          message = getBlockMessage(battle.monster.nameKo, reducedDamage);
        } else {
          // hit or critical - 저항 피드백 포함
          message = getAttackMessage(attackType, battle.monster.nameKo, damage, isCritical, resistanceMultiplier, isMinDamage);
        }
      }

      // 플레이어 공격 적용
      playerAttack(damage, message, attackType);

      // 결과 확인 (몬스터가 아직 살아있으면 반격)
      const newMonsterHp = battle.monsterCurrentHp - damage;
      if (newMonsterHp > 0 && canMonsterAttack(battle.monster)) {
        // 몬스터 반격 판정 (확장 - 보너스/무기막기 지원)
        const monsterHitResult = determineHitResultEx({
          attackerStats: { lck: 5 }, // 몬스터 기본 LCK
          defenderStats: { dex: attackerStats.dex ?? 10, con: attackerStats.con ?? 10 },
          isPhysical: true,
          bonusDodge,
          bonusBlock,
          weaponType: defenderWeaponType,
          weaponProficiency: defenderWeaponProficiency,
          bonusWeaponBlock,
        });

        let monsterDamage = 0;
        let monsterMessage = "";
        let counterDamage = 0;

        if (monsterHitResult.result === "missed") {
          // 몬스터 공격 빗맞음
          monsterMessage = getMonsterMissMessage();
        } else if (monsterHitResult.result === "dodged") {
          // 플레이어 회피
          monsterMessage = getPlayerDodgeMessage();
        } else if (monsterHitResult.result === "weapon_blocked") {
          // 플레이어 무기막기
          const baseDamageReceived = calculateMonsterDamage(battle.monster.stats.attack, playerDefense);
          monsterDamage = Math.floor(baseDamageReceived * monsterHitResult.damageMultiplier);
          monsterDamage = Math.max(0, monsterDamage);
          const reducedAmount = Math.floor(baseDamageReceived - monsterDamage);

          monsterMessage = getPlayerWeaponBlockMessage(
            defenderWeaponType || "fist",
            reducedAmount,
            monsterHitResult.specialEffect
          );

          // 반격 효과 (counter/riposte) 발동 시
          if (monsterHitResult.specialTriggered &&
              (monsterHitResult.specialEffect === "counter" || monsterHitResult.specialEffect === "riposte")) {
            counterDamage = calculateCounterDamage(
              reducedAmount,
              attackerStats.str ?? 10,
              defenderWeaponProficiency
            );
            monsterMessage += ` ${getCounterDamageMessage(counterDamage)}`;
          }
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
          // 반격 데미지가 있으면 몬스터에게 추가 피해
          if (counterDamage > 0) {
            // 반격은 별도 로그로 처리하거나, 몬스터 HP 직접 감소 필요
            // 현재는 메시지만 표시 (실제 피해는 별도 구현 필요)
          }
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
