import { useCallback } from "react";
import { useBattleStore } from "@/application/stores";
import type { CharacterStats } from "@/entities/character";
import type { Skill } from "@/entities/skill";
import type { MagicElement, ProficiencyType, CombatProficiencyType, WeaponType } from "@/entities/proficiency";
import type { StatusType } from "@/entities/status";
import {
  calculateMagicDamage,
  calculatePhysicalDamage,
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
import { canMonsterAttack } from "@/entities/monster";

interface UseCastSpellOptions {
  onMonsterTurn?: () => void;
}

interface CastSpellParams {
  skill: Skill;
  casterStats: CharacterStats;
  proficiencyLevel: number;
  playerDefense?: number;
}

export function useCastSpell(options: UseCastSpellOptions = {}) {
  const {
    battle,
    useMp,
    playerAttack,
    healHp,
    applyPlayerStatus,
    applyMonsterStatus,
    addLog,
    processStatusEffects,
    tickAllStatuses,
    getPlayerMagicModifier,
  } = useBattleStore();

  const { onMonsterTurn } = options;

  const castSpell = useCallback(
    (params: CastSpellParams) => {
      const { skill, casterStats, proficiencyLevel, playerDefense = 0 } = params;

      // MP 확인 및 소모 (0이거나 undefined면 무시)
      if (skill.mpCost && skill.mpCost > 0 && !useMp(skill.mpCost)) {
        addLog({
          turn: battle.turn,
          actor: "system",
          action: "mp_fail",
          message: "MP가 부족합니다!",
        });
        return false;
      }

      // 스킬 타입별 처리
      switch (skill.type) {
        case "physical_attack":
          handlePhysicalAttack(skill, casterStats, proficiencyLevel, playerDefense);
          break;

        case "magic_attack":
          handleMagicAttack(skill, casterStats, proficiencyLevel);
          break;

        case "heal":
          handleHeal(skill);
          break;

        case "buff":
          handleBuff(skill);
          break;

        case "debuff":
          handleDebuff(skill);
          break;

        default:
          console.warn(`Unknown skill type: ${skill.type}`);
          return false;
      }

      return true;
    },
    [battle, useMp, addLog]
  );

  // 물리 공격 처리 (마샬아츠 등)
  const handlePhysicalAttack = useCallback(
    (skill: Skill, casterStats: CharacterStats, proficiencyLevel: number, playerDefense: number) => {
      if (!battle.monster) return;

      const { monsterAttack } = useBattleStore.getState();

      // 공격 판정 (빗맞음 → 회피 → 막기 → 치명타 → 명중)
      const hitResult = determineHitResult(
        { lck: casterStats.lck ?? 10, dex: casterStats.dex, int: casterStats.int },
        { dex: battle.monster.stats.speed ?? 5, con: Math.floor(battle.monster.stats.defense / 2) },
        true // 물리 공격
      );

      let totalDamage = 0;
      let message = "";
      const isCritical = hitResult.result === "critical";

      if (hitResult.result === "missed") {
        message = getMissMessage(battle.monster.nameKo);
      } else if (hitResult.result === "dodged") {
        message = getDodgeMessage(battle.monster.nameKo);
      } else {
        // 다중 타격 계산
        let hitCount = 1;
        if (skill.hitCount) {
          const [min, max] = skill.hitCount;
          hitCount = Math.floor(Math.random() * (max - min + 1)) + min;
        }

        for (let i = 0; i < hitCount; i++) {
          let damage = calculatePhysicalDamage({
            baseDamage: skill.baseDamage || 10,
            attackerStr: casterStats.str,
            weaponType: (skill.proficiencyType || "fist") as WeaponType,
            proficiencyLevel,
            targetDefense: battle.monster.stats.defense,
          });

          // 배율 적용 (치명타 or 막기)
          damage = Math.floor(damage * hitResult.damageMultiplier);
          totalDamage += Math.max(1, damage);
        }

        if (hitResult.result === "blocked") {
          message = getBlockMessage(battle.monster.nameKo, totalDamage);
        } else {
          message = hitCount > 1
            ? `${skill.icon} ${skill.nameKo}! ${hitCount}연속 공격으로 ${battle.monster.nameKo}에게 총 ${totalDamage} 데미지!`
            : getAttackMessage(
                (skill.proficiencyType || "fist") as CombatProficiencyType,
                battle.monster.nameKo,
                totalDamage,
                isCritical
              );
        }
      }

      // 공격 적용
      playerAttack(totalDamage, message, skill.proficiencyType);

      // 상태이상 부여 확률 체크 (명중 시에만)
      if (totalDamage > 0 && skill.statusEffect && skill.statusChance) {
        const roll = Math.random() * 100;
        if (roll < skill.statusChance) {
          applyMonsterStatus(
            skill.statusEffect as StatusType,
            skill.statusValue || 0,
            skill.statusDuration
          );
        }
      }

      // 몬스터 반격 (살아있고 패시브가 아니면)
      const newMonsterHp = battle.monsterCurrentHp - totalDamage;
      if (newMonsterHp > 0 && canMonsterAttack(battle.monster)) {
        // 몬스터 반격 판정
        const monsterHitResult = determineHitResult(
          { lck: 5 },
          { dex: casterStats.dex ?? 10, con: casterStats.con ?? 10 },
          true
        );

        let monsterDmg = 0;
        let monsterMsg = "";

        if (monsterHitResult.result === "missed") {
          monsterMsg = getMonsterMissMessage();
        } else if (monsterHitResult.result === "dodged") {
          monsterMsg = getPlayerDodgeMessage();
        } else {
          monsterDmg = calculateMonsterDamage(battle.monster.stats.attack, playerDefense);
          monsterDmg = Math.floor(monsterDmg * monsterHitResult.damageMultiplier);
          monsterDmg = Math.max(0, monsterDmg);

          if (monsterHitResult.result === "blocked") {
            const reducedAmount = Math.floor(monsterDmg / 2);
            monsterMsg = getPlayerBlockMessage(reducedAmount);
          } else {
            monsterMsg = getMonsterAttackMessage(battle.monster.nameKo, monsterDmg);
          }
        }

        setTimeout(() => {
          monsterAttack(monsterDmg, monsterMsg);
        }, 500);
      }
    },
    [battle, playerAttack, applyMonsterStatus]
  );

  // 마법 공격 처리
  const handleMagicAttack = useCallback(
    (skill: Skill, casterStats: CharacterStats, proficiencyLevel: number) => {
      if (!battle.monster) return;

      const magicModifier = getPlayerMagicModifier();

      // 마법 공격 판정 (회피 → 막기 → 치명타 → 명중) - 마법은 빗맞음 없음
      const hitResult = determineHitResult(
        { lck: casterStats.lck ?? 10, dex: casterStats.dex, int: casterStats.int },
        { dex: battle.monster.stats.speed ?? 5, con: Math.floor(battle.monster.stats.defense / 2) },
        false // 마법 공격 (빗맞음 없음)
      );

      let finalDamage = 0;
      let message = "";
      const isCritical = hitResult.result === "critical";

      if (hitResult.result === "dodged") {
        message = getDodgeMessage(battle.monster.nameKo);
      } else {
        // 데미지 계산
        let damage = calculateMagicDamage({
          baseDamage: skill.baseDamage || 10,
          attackerInt: casterStats.int,
          element: skill.element as MagicElement,
          proficiencyLevel,
          targetDefense: battle.monster.stats.defense,
          targetElement: battle.monster.element,
        });

        // 마법 버프 적용
        if (magicModifier !== 0) {
          damage = Math.floor(damage * (1 + magicModifier / 100));
        }

        // 배율 적용 (치명타 or 막기)
        finalDamage = Math.floor(damage * hitResult.damageMultiplier);
        finalDamage = Math.max(1, finalDamage);

        if (hitResult.result === "blocked") {
          message = getBlockMessage(battle.monster.nameKo, finalDamage);
        } else {
          message = getAttackMessage(
            skill.element as CombatProficiencyType,
            battle.monster.nameKo,
            finalDamage,
            isCritical
          );
        }
      }

      // 공격 적용
      playerAttack(finalDamage, message, skill.proficiencyType);

      // 몬스터 턴 처리 (패시브가 아니고 살아있으면)
      if (
        battle.monster.behavior !== "passive" &&
        battle.monsterCurrentHp - finalDamage > 0
      ) {
        setTimeout(() => {
          processStatusEffects();
          tickAllStatuses();
          onMonsterTurn?.();
        }, 500);
      }
    },
    [
      battle,
      getPlayerMagicModifier,
      playerAttack,
      processStatusEffects,
      tickAllStatuses,
      onMonsterTurn,
    ]
  );

  // 회복 처리
  const handleHeal = useCallback(
    (skill: Skill) => {
      const healAmount = skill.healAmount || 0;
      const healPercent = skill.healPercent || 0;

      let totalHeal = healAmount;
      if (healPercent > 0) {
        totalHeal += Math.floor(battle.playerMaxHp * (healPercent / 100));
      }

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "skill",
        message: `${skill.icon} ${skill.nameKo} 시전!`,
      });

      healHp(totalHeal);

      // 몬스터 턴
      if (battle.monster?.behavior !== "passive") {
        setTimeout(() => {
          processStatusEffects();
          tickAllStatuses();
          onMonsterTurn?.();
        }, 500);
      }
    },
    [battle, addLog, healHp, processStatusEffects, tickAllStatuses, onMonsterTurn]
  );

  // 버프 처리
  const handleBuff = useCallback(
    (skill: Skill) => {
      if (!skill.statusEffect) return;

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "skill",
        message: `${skill.icon} ${skill.nameKo} 시전!`,
      });

      applyPlayerStatus(
        skill.statusEffect as StatusType,
        skill.statusValue || 0,
        skill.statusDuration
      );

      // 몬스터 턴
      if (battle.monster?.behavior !== "passive") {
        setTimeout(() => {
          processStatusEffects();
          tickAllStatuses();
          onMonsterTurn?.();
        }, 500);
      }
    },
    [
      battle,
      addLog,
      applyPlayerStatus,
      processStatusEffects,
      tickAllStatuses,
      onMonsterTurn,
    ]
  );

  // 디버프 처리
  const handleDebuff = useCallback(
    (skill: Skill) => {
      if (!skill.statusEffect) return;

      addLog({
        turn: battle.turn,
        actor: "player",
        action: "skill",
        message: `${skill.icon} ${skill.nameKo} 시전!`,
      });

      applyMonsterStatus(
        skill.statusEffect as StatusType,
        skill.statusValue || 0,
        skill.statusDuration
      );

      // 몬스터 턴
      if (battle.monster?.behavior !== "passive") {
        setTimeout(() => {
          processStatusEffects();
          tickAllStatuses();
          onMonsterTurn?.();
        }, 500);
      }
    },
    [
      battle,
      addLog,
      applyMonsterStatus,
      processStatusEffects,
      tickAllStatuses,
      onMonsterTurn,
    ]
  );

  return { castSpell };
}
