import type { CharacterStats } from "@/entities/character";
import type { MagicElement, WeaponType, ProficiencyType, AttackType } from "@/entities/proficiency";
import {
  getDamageMultiplier,
  getMagicEffectiveness,
  getDayBoostMultiplier,
  isWeaponProficiency,
  isMagicProficiency,
  WEAPON_ATTACK_TYPE,
} from "@/entities/proficiency";
import { getElementTimeMultiplier, type Period } from "@/entities/game-time";
import { getWeatherElementMultiplier, type WeatherType } from "@/entities/weather";
import { getKarmaElementMultiplier } from "@/entities/karma";

// 물리 공격 파라미터
export interface PhysicalAttackParams {
  baseDamage: number;
  attackerStr: number;
  weaponType: WeaponType;
  proficiencyLevel: number;
  targetDefense: number;
  attackTypeResistance?: number;  // 공격 타입 저항 배율 (기본 1.0)
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
  karma?: number; // 플레이어 카르마 (-100 ~ +100)
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
  karma?: number; // 플레이어 카르마 (-100 ~ +100)
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
 * 공식: (baseDamage + STR * 0.5) * proficiencyMultiplier * attackTypeResistance * variance - targetDefense
 */
export function calculatePhysicalDamage(params: PhysicalAttackParams): number {
  const {
    baseDamage,
    attackerStr,
    proficiencyLevel,
    targetDefense,
    attackTypeResistance = 1.0,
  } = params;

  const rawDamage = baseDamage + attackerStr * 0.5;
  const proficiencyMultiplier = getDamageMultiplier(proficiencyLevel);
  const baseResult = rawDamage * proficiencyMultiplier * attackTypeResistance - targetDefense;
  const finalDamage = applyDamageVariance(baseResult);

  return Math.max(1, finalDamage); // 최소 1 데미지
}

/**
 * 무기 타입에서 공격 타입 가져오기
 */
export function getAttackTypeFromWeapon(weaponType: WeaponType): AttackType {
  return WEAPON_ATTACK_TYPE[weaponType];
}

/**
 * 마법 데미지 계산
 * 공식: (baseDamage + INT * 0.8) * proficiencyMultiplier * effectivenessMultiplier * dayBoost * timeBoost * weatherBoost * karmaBoost * variance - (defense * 0.3)
 */
export function calculateMagicDamage(params: MagicAttackParams): number {
  const { baseDamage, attackerInt, element, proficiencyLevel, targetDefense, targetElement, period, weather, karma } =
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

  // 카르마 부스트 (신성/암흑 마법에만 적용)
  // 선한 카르마 = 신성 +20%, 암흑 -30%
  // 악한 카르마 = 암흑 +20%, 신성 -30%
  const karmaMultiplier = karma !== undefined
    ? getKarmaElementMultiplier(element, karma)
    : 1.0;

  // 마법 방어 (물리 방어의 30%만 적용)
  const magicDefense = targetDefense * 0.3;

  const baseResult =
    rawDamage *
    proficiencyMultiplier *
    effectivenessMultiplier *
    dayBoostMultiplier *
    timeBoostMultiplier *
    weatherMultiplier *
    karmaMultiplier -
    magicDefense;
  const finalDamage = applyDamageVariance(baseResult);

  return Math.max(1, finalDamage);
}

/**
 * 통합 데미지 계산 (무기/마법 자동 판별)
 */
export function calculateDamage(params: AttackParams): number {
  const { baseDamage, attackerStats, attackType, proficiencyLevel, targetDefense, targetElement, period, weather, karma } =
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
      karma,
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

// ============ 암습 시스템 (Ambush) ============

/**
 * 암습 결과 타입
 */
export interface AmbushResult {
  damage: number;
  isAmbush: boolean;
  bonusMultiplier: number;
}

/**
 * 암습 데미지 계산
 * 전투 첫 공격에만 적용 (단검 등)
 * @param baseDamage 기본 데미지
 * @param ambushChance 암습 확률 (%)
 * @param ambushDamage 암습 추가 피해 (%)
 */
export function calculateAmbushDamage(
  baseDamage: number,
  ambushChance: number,
  ambushDamage: number
): AmbushResult {
  // 암습 확률 체크
  const roll = Math.random() * 100;
  if (roll < ambushChance) {
    const bonusMultiplier = 1 + ambushDamage / 100;
    return {
      damage: Math.floor(baseDamage * bonusMultiplier),
      isAmbush: true,
      bonusMultiplier,
    };
  }

  return {
    damage: baseDamage,
    isAmbush: false,
    bonusMultiplier: 1.0,
  };
}

/**
 * 암습 확률 계산 (DEX, LCK 기반 보너스)
 * 기본 암습 확률 + DEX * 0.2 + LCK * 0.1
 */
export function getAmbushChance(
  baseAmbushChance: number,
  dex: number,
  lck: number
): number {
  const dexBonus = dex * 0.2;
  const lckBonus = lck * 0.1;
  return Math.min(80, baseAmbushChance + dexBonus + lckBonus); // 최대 80%
}

/**
 * 단검 암습 보너스 데미지
 * 기본: 50% 추가 피해
 * 숙련도 보너스: 숙련도 레벨 * 0.5%
 */
export function getDaggerAmbushBonus(proficiencyLevel: number): number {
  const base = 50; // 기본 50% 추가 피해
  const profBonus = proficiencyLevel * 0.5;
  return base + profBonus; // 최대 100% (숙련도 100 기준)
}

// ============ 패리 시스템 (Parry) - 대검 전용 ============

/**
 * 패리 가능 무기 목록
 */
export const PARRY_WEAPONS: WeaponType[] = ["great_sword"];

/**
 * 패리 가능 여부 확인
 */
export function canParry(weaponType: WeaponType): boolean {
  return PARRY_WEAPONS.includes(weaponType);
}

/**
 * 패리 결과 타입
 */
export interface ParryResult {
  isParried: boolean;
  damageReduction: number; // 피해 감소율 (0-1)
  counterDamage: number; // 반격 피해 (패리 성공 시)
}

/**
 * 패리 확률 계산
 * 공식: 기본 5% + DEX * 0.2 + 숙련도 * 0.1 (최대 20%)
 * @param dex 민첩 스탯
 * @param proficiencyLevel 대검 숙련도
 */
export function getParryChance(dex: number, proficiencyLevel: number): number {
  const base = 5;
  const dexBonus = dex * 0.2;
  const profBonus = proficiencyLevel * 0.1;
  return Math.min(20, base + dexBonus + profBonus);
}

/**
 * 패리 시도
 * @param weaponType 현재 장착 무기
 * @param dex 민첩 스탯
 * @param proficiencyLevel 대검 숙련도
 * @param incomingDamage 받는 피해량
 */
export function attemptParry(
  weaponType: WeaponType,
  dex: number,
  proficiencyLevel: number,
  incomingDamage: number
): ParryResult {
  // 패리 불가능한 무기
  if (!canParry(weaponType)) {
    return { isParried: false, damageReduction: 0, counterDamage: 0 };
  }

  const parryChance = getParryChance(dex, proficiencyLevel);
  const roll = Math.random() * 100;

  if (roll < parryChance) {
    // 패리 성공: 피해 70% 감소, 반격 데미지 발생
    const damageReduction = 0.7;
    // 반격 피해: 막은 피해의 30% + 숙련도 보너스
    const blockedDamage = incomingDamage * damageReduction;
    const counterBase = blockedDamage * 0.3;
    const profBonus = 1 + proficiencyLevel * 0.005; // 숙련도 100에서 +50%
    const counterDamage = Math.floor(counterBase * profBonus);

    return {
      isParried: true,
      damageReduction,
      counterDamage,
    };
  }

  return { isParried: false, damageReduction: 0, counterDamage: 0 };
}
