import type { CharacterStats } from "@/entities/character";
import type { MagicElement, WeaponType, ProficiencyType } from "@/entities/proficiency";
import {
  getDamageMultiplier,
  getMagicEffectiveness,
  getDayBoostMultiplier,
  isWeaponProficiency,
  isMagicProficiency,
} from "@/entities/proficiency";

// 물리 공격 파라미터
export interface PhysicalAttackParams {
  baseDamage: number;
  attackerStr: number;
  weaponType: WeaponType;
  proficiencyLevel: number;
  targetDefense: number;
}

// 마법 공격 파라미터
export interface MagicAttackParams {
  baseDamage: number;
  attackerInt: number;
  element: MagicElement;
  proficiencyLevel: number;
  targetDefense: number;
  targetElement?: MagicElement | null;
}

// 일반 공격 파라미터 (무기/마법 통합)
export interface AttackParams {
  baseDamage: number;
  attackerStats: CharacterStats;
  attackType: ProficiencyType;
  proficiencyLevel: number;
  targetDefense: number;
  targetElement?: MagicElement | null;
}

/**
 * 물리 데미지 계산
 * 공식: (baseDamage + STR * 0.5) * proficiencyMultiplier - targetDefense
 */
export function calculatePhysicalDamage(params: PhysicalAttackParams): number {
  const { baseDamage, attackerStr, proficiencyLevel, targetDefense } = params;

  const rawDamage = baseDamage + attackerStr * 0.5;
  const proficiencyMultiplier = getDamageMultiplier(proficiencyLevel);
  const finalDamage = rawDamage * proficiencyMultiplier - targetDefense;

  return Math.max(1, Math.floor(finalDamage)); // 최소 1 데미지
}

/**
 * 마법 데미지 계산
 * 공식: (baseDamage + INT * 0.8) * proficiencyMultiplier * effectivenessMultiplier * dayBoost - (defense * 0.3)
 */
export function calculateMagicDamage(params: MagicAttackParams): number {
  const { baseDamage, attackerInt, element, proficiencyLevel, targetDefense, targetElement } =
    params;

  const rawDamage = baseDamage + attackerInt * 0.8;
  const proficiencyMultiplier = getDamageMultiplier(proficiencyLevel);

  // 상성 배율 (대상 속성이 있을 경우)
  const effectivenessMultiplier = targetElement
    ? getMagicEffectiveness(element, targetElement)
    : 1.0;

  // 요일 부스트
  const dayBoostMultiplier = getDayBoostMultiplier(element);

  // 마법 방어 (물리 방어의 30%만 적용)
  const magicDefense = targetDefense * 0.3;

  const finalDamage =
    rawDamage * proficiencyMultiplier * effectivenessMultiplier * dayBoostMultiplier - magicDefense;

  return Math.max(1, Math.floor(finalDamage));
}

/**
 * 통합 데미지 계산 (무기/마법 자동 판별)
 */
export function calculateDamage(params: AttackParams): number {
  const { baseDamage, attackerStats, attackType, proficiencyLevel, targetDefense, targetElement } =
    params;

  // 무기 공격
  if (isWeaponProficiency(attackType)) {
    return calculatePhysicalDamage({
      baseDamage,
      attackerStr: attackerStats.str,
      weaponType: attackType as WeaponType,
      proficiencyLevel,
      targetDefense,
    });
  }

  // 마법 공격
  if (isMagicProficiency(attackType)) {
    return calculateMagicDamage({
      baseDamage,
      attackerInt: attackerStats.int,
      element: attackType as MagicElement,
      proficiencyLevel,
      targetDefense,
      targetElement,
    });
  }

  // 기본 공격
  return Math.max(1, Math.floor(baseDamage - targetDefense));
}

/**
 * 몬스터 데미지 계산 (간단 버전)
 */
export function calculateMonsterDamage(
  monsterAttack: number,
  playerDefense: number = 0
): number {
  const damage = monsterAttack - playerDefense * 0.5;
  return Math.max(0, Math.floor(damage));
}

/**
 * 크리티컬 히트 확률 계산
 * DEX 기반: 5% + (DEX * 0.1)%
 */
export function getCriticalChance(dex: number): number {
  return Math.min(50, 5 + dex * 0.1); // 최대 50%
}

/**
 * 크리티컬 데미지 배율
 */
export const CRITICAL_MULTIPLIER = 1.5;

/**
 * 크리티컬 히트 적용
 */
export function applyCritical(damage: number, dex: number): { damage: number; isCritical: boolean } {
  const critChance = getCriticalChance(dex);
  const isCritical = Math.random() * 100 < critChance;

  if (isCritical) {
    return { damage: Math.floor(damage * CRITICAL_MULTIPLIER), isCritical: true };
  }

  return { damage, isCritical: false };
}
