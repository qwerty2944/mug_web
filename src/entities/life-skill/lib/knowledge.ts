import type { KnowledgeType, AttackType } from "@/entities/proficiency";
import {
  calculateKnowledgeBonus,
  type KnowledgeBonus,
  ATTACK_TYPE_TO_KNOWLEDGE,
} from "@/entities/proficiency";

/**
 * 지식 스킬로 공격 타입별 데미지 보너스 계산
 * @param attackType 공격 타입 (slash/pierce/crush)
 * @param knowledgeProficiencies 지식 스킬 숙련도
 * @returns 데미지 배율 (1.0 = 보너스 없음)
 */
export function getKnowledgeAttackBonus(
  attackType: AttackType,
  knowledgeProficiencies: Partial<Record<KnowledgeType, number>>
): number {
  const bonus = calculateKnowledgeBonus(knowledgeProficiencies);

  switch (attackType) {
    case "slash":
      return 1 + bonus.slashBonus / 100;
    case "pierce":
      return 1 + bonus.pierceBonus / 100;
    case "crush":
      return 1 + bonus.crushBonus / 100;
    default:
      return 1.0;
  }
}

/**
 * 지식 스킬로 마법 데미지 보너스 계산
 * @param knowledgeProficiencies 지식 스킬 숙련도
 * @returns 데미지 배율 (1.0 = 보너스 없음)
 */
export function getKnowledgeMagicBonus(
  knowledgeProficiencies: Partial<Record<KnowledgeType, number>>
): number {
  const bonus = calculateKnowledgeBonus(knowledgeProficiencies);
  return 1 + bonus.magicBonus / 100;
}

/**
 * 지식 스킬로 독 데미지 보너스 계산
 * @param knowledgeProficiencies 지식 스킬 숙련도
 * @returns 데미지 배율 (1.0 = 보너스 없음)
 */
export function getKnowledgePoisonBonus(
  knowledgeProficiencies: Partial<Record<KnowledgeType, number>>
): number {
  const bonus = calculateKnowledgeBonus(knowledgeProficiencies);
  return 1 + bonus.poisonBonus / 100;
}

/**
 * 지식 스킬로 치유량 보너스 계산
 * @param knowledgeProficiencies 지식 스킬 숙련도
 * @returns 치유 배율 (1.0 = 보너스 없음)
 */
export function getKnowledgeHealingBonus(
  knowledgeProficiencies: Partial<Record<KnowledgeType, number>>
): number {
  const bonus = calculateKnowledgeBonus(knowledgeProficiencies);
  return 1 + bonus.healingBonus / 100;
}

/**
 * 지식 스킬로 방어력 보너스 계산
 * @param knowledgeProficiencies 지식 스킬 숙련도
 * @returns 방어력 배율 (1.0 = 보너스 없음)
 */
export function getKnowledgeDefenseBonus(
  knowledgeProficiencies: Partial<Record<KnowledgeType, number>>
): number {
  const bonus = calculateKnowledgeBonus(knowledgeProficiencies);
  return 1 + bonus.defenseBonus / 100;
}

/**
 * 공격 타입에 연관된 지식 스킬 가져오기
 * - slash/pierce: anatomy
 * - crush: metallurgy
 */
export function getRelatedKnowledgeSkill(attackType: AttackType): KnowledgeType {
  return ATTACK_TYPE_TO_KNOWLEDGE[attackType];
}

/**
 * 전체 지식 보너스 객체 가져오기
 */
export function getFullKnowledgeBonus(
  knowledgeProficiencies: Partial<Record<KnowledgeType, number>>
): KnowledgeBonus {
  return calculateKnowledgeBonus(knowledgeProficiencies);
}
