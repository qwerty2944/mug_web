import type { CharacterStats } from "@/entities/character";
import type { MagicElement, WeaponType, ProficiencyType } from "@/entities/proficiency";
import {
  getDamageMultiplier,
  getMagicEffectiveness,
  getDayBoostMultiplier,
  isWeaponProficiency,
  isMagicProficiency,
} from "@/entities/proficiency";
import { getElementTimeMultiplier, type Period } from "@/entities/game-time";
import { getWeatherElementMultiplier, type WeatherType } from "@/entities/weather";

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
  period?: Period; // 현재 시간대 (밤낮 버프 적용)
  weather?: WeatherType; // 현재 날씨 (날씨 버프 적용)
}

// 일반 공격 파라미터 (무기/마법 통합)
export interface AttackParams {
  baseDamage: number;
  attackerStats: CharacterStats;
  attackType: ProficiencyType;
  proficiencyLevel: number;
  targetDefense: number;
  targetElement?: MagicElement | null;
  period?: Period; // 현재 시간대 (밤낮 버프 적용)
  weather?: WeatherType; // 현재 날씨 (날씨 버프 적용)
}

/**
 * 데미지 편차 적용 (±15%)
 * @param damage 기본 데미지
 * @returns 편차 적용된 데미지
 */
export function applyDamageVariance(damage: number): number {
  const variance = 0.15; // ±15%
  const multiplier = 1 + (Math.random() * 2 - 1) * variance; // 0.85 ~ 1.15
  return Math.max(1, Math.floor(damage * multiplier));
}

/**
 * 물리 데미지 계산
 * 공식: (baseDamage + STR * 0.5) * proficiencyMultiplier * variance - targetDefense
 */
export function calculatePhysicalDamage(params: PhysicalAttackParams): number {
  const { baseDamage, attackerStr, proficiencyLevel, targetDefense } = params;

  const rawDamage = baseDamage + attackerStr * 0.5;
  const proficiencyMultiplier = getDamageMultiplier(proficiencyLevel);
  const baseResult = rawDamage * proficiencyMultiplier - targetDefense;
  const finalDamage = applyDamageVariance(baseResult);

  return Math.max(1, finalDamage); // 최소 1 데미지
}

/**
 * 마법 데미지 계산
 * 공식: (baseDamage + INT * 0.8) * proficiencyMultiplier * effectivenessMultiplier * dayBoost * timeBoost * weatherBoost * variance - (defense * 0.3)
 */
export function calculateMagicDamage(params: MagicAttackParams): number {
  const { baseDamage, attackerInt, element, proficiencyLevel, targetDefense, targetElement, period, weather } =
    params;

  const rawDamage = baseDamage + attackerInt * 0.8;
  const proficiencyMultiplier = getDamageMultiplier(proficiencyLevel);

  // 상성 배율 (대상 속성이 있을 경우)
  const effectivenessMultiplier = targetElement
    ? getMagicEffectiveness(element, targetElement)
    : 1.0;

  // 요일 부스트 (화요일 = 화염 +20% 등)
  const dayBoostMultiplier = getDayBoostMultiplier(element);

  // 시간대 부스트 (밤 = 암흑 +20%, 낮 = 신성 +15%)
  const timeBoostMultiplier = period
    ? getElementTimeMultiplier(element, period)
    : 1.0;

  // 날씨 부스트 (비 = 번개 +15%, 맑음 = 신성 +10% 등)
  const weatherMultiplier = weather
    ? getWeatherElementMultiplier(element, weather)
    : 1.0;

  // 마법 방어 (물리 방어의 30%만 적용)
  const magicDefense = targetDefense * 0.3;

  const baseResult =
    rawDamage *
    proficiencyMultiplier *
    effectivenessMultiplier *
    dayBoostMultiplier *
    timeBoostMultiplier *
    weatherMultiplier -
    magicDefense;
  const finalDamage = applyDamageVariance(baseResult);

  return Math.max(1, finalDamage);
}

/**
 * 통합 데미지 계산 (무기/마법 자동 판별)
 */
export function calculateDamage(params: AttackParams): number {
  const { baseDamage, attackerStats, attackType, proficiencyLevel, targetDefense, targetElement, period, weather } =
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
      period,
      weather,
    });
  }

  // 기본 공격
  return Math.max(1, Math.floor(baseDamage - targetDefense));
}

/**
 * 몬스터 데미지 계산 (편차 적용)
 */
export function calculateMonsterDamage(
  monsterAttack: number,
  playerDefense: number = 0
): number {
  const baseDamage = monsterAttack - playerDefense * 0.5;
  const finalDamage = applyDamageVariance(baseDamage);
  return Math.max(0, finalDamage);
}

/**
 * 크리티컬 히트 확률 계산 (LCK 기반)
 * 물리: 5% + LCK * 0.3 + DEX * 0.05 (최대 60%)
 * 마법: 5% + LCK * 0.3 + INT * 0.05 (최대 60%)
 */
export function getCriticalChance(lck: number, secondaryStat: number): number {
  const base = 5;
  const lckBonus = lck * 0.3;
  const secondaryBonus = secondaryStat * 0.05;
  return Math.min(60, base + lckBonus + secondaryBonus);
}

/**
 * 크리티컬 데미지 배율 계산 (LCK 기반)
 * 기본 1.5배 + LCK * 0.01 (최대 2.5배)
 */
export function getCriticalMultiplier(lck: number): number {
  const base = 1.5;
  const lckBonus = lck * 0.01;
  return Math.min(2.5, base + lckBonus);
}

/**
 * 크리티컬 히트 적용
 * @param damage 기본 데미지
 * @param lck 행운 스탯
 * @param secondaryStat 물리: DEX, 마법: INT
 */
export function applyCritical(
  damage: number,
  lck: number,
  secondaryStat: number
): { damage: number; isCritical: boolean; multiplier: number } {
  const critChance = getCriticalChance(lck, secondaryStat);
  const isCritical = Math.random() * 100 < critChance;

  if (isCritical) {
    const multiplier = getCriticalMultiplier(lck);
    return { damage: Math.floor(damage * multiplier), isCritical: true, multiplier };
  }

  return { damage, isCritical: false, multiplier: 1.0 };
}

// ============ 회피/막기/빗맞음 시스템 ============

export type HitResult = "hit" | "critical" | "blocked" | "dodged" | "missed";

/**
 * 회피 확률 계산 (DEX 기반)
 * 공식: 3% + DEX * 0.4 (최대 25%)
 */
export function getDodgeChance(dex: number): number {
  const base = 3;
  const dexBonus = dex * 0.4;
  return Math.min(25, base + dexBonus);
}

/**
 * 막기 확률 계산 (CON 기반)
 * 공식: 5% + CON * 0.3 (최대 20%)
 */
export function getBlockChance(con: number): number {
  const base = 5;
  const conBonus = con * 0.3;
  return Math.min(20, base + conBonus);
}

/**
 * 빗맞음 확률 (고정 5%)
 */
export function getMissChance(): number {
  return 5;
}

/**
 * 공격 결과 판정
 * 순서: 빗맞음 → 회피 → 막기 → 치명타 → 일반 명중
 */
export function determineHitResult(
  attackerStats: { lck: number; dex?: number; int?: number },
  defenderStats: { dex: number; con: number },
  isPhysical: boolean = true
): { result: HitResult; damageMultiplier: number; critMultiplier?: number } {
  const roll = Math.random() * 100;
  let threshold = 0;

  // 1. 빗맞음 체크 (물리 공격만)
  if (isPhysical) {
    threshold += getMissChance();
    if (roll < threshold) {
      return { result: "missed", damageMultiplier: 0 };
    }
  }

  // 2. 회피 체크
  threshold += getDodgeChance(defenderStats.dex);
  if (roll < threshold) {
    return { result: "dodged", damageMultiplier: 0 };
  }

  // 3. 막기 체크
  threshold += getBlockChance(defenderStats.con);
  if (roll < threshold) {
    return { result: "blocked", damageMultiplier: 0.5 };
  }

  // 4. 치명타 체크
  const secondaryStat = isPhysical ? (attackerStats.dex ?? 10) : (attackerStats.int ?? 10);
  const critChance = getCriticalChance(attackerStats.lck, secondaryStat);
  if (Math.random() * 100 < critChance) {
    const critMultiplier = getCriticalMultiplier(attackerStats.lck);
    return { result: "critical", damageMultiplier: critMultiplier, critMultiplier };
  }

  // 5. 일반 명중
  return { result: "hit", damageMultiplier: 1.0 };
}
