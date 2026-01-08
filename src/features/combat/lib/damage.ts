import type {
  CharacterStats,
  ElementBoost,
  ElementResist,
} from "@/entities/character";
import {
  getElementBoostMultiplier,
  getElementResistReduction,
} from "@/entities/character";
import type {
  MagicElement,
  WeaponType,
  ProficiencyType,
  AttackType,
  WeaponBlockInfo,
  WeaponBlockSpecial,
} from "@/entities/proficiency";
import {
  getDamageMultiplier,
  getMagicEffectiveness,
  getDayBoostMultiplier,
  isWeaponProficiency,
  isMagicProficiency,
  WEAPON_ATTACK_TYPE,
  WEAPON_BLOCK_CONFIG,
} from "@/entities/proficiency";
import { getElementTimeMultiplier, type Period } from "@/entities/game-time";
import {
  getWeatherElementMultiplier,
  type WeatherType,
} from "@/entities/weather";
import { getKarmaElementMultiplier } from "@/entities/karma";

// 물리 공격 파라미터
export interface PhysicalAttackParams {
  baseDamage: number;
  attackerStr: number;
  weaponType: WeaponType;
  proficiencyLevel: number;
  targetDefense: number;
  attackTypeResistance?: number; // 공격 타입 저항 배율 (기본 1.0)
  // 신규 스탯 (선택적, 제공 시 합산)
  attackerPhysicalAttack?: number; // 추가 물리공격력
  targetPhysicalDefense?: number; // 대상 물리방어력 (targetDefense 대체용)
  attackerPhysicalPenetration?: number; // 물리관통 % (적 방어력 무시)
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
  // 신규 스탯 (선택적)
  attackerMagicAttack?: number; // 추가 마법공격력
  targetMagicDefense?: number; // 대상 마법방어력 (targetDefense * 0.3 대체)
  attackerElementBoost?: number; // 해당 속성 강화 % (ElementBoost에서 추출)
  targetElementResist?: number; // 대상의 해당 속성 저항 %
  attackerMagicPenetration?: number; // 마법관통 % (적 마법방어력 무시)
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
 * 공식: (baseDamage + STR * 0.5 + physicalAttack) * proficiencyMultiplier * attackTypeResistance - effectiveDefense
 * 관통 적용: effectiveDefense = 방어력 * (1 - 관통% / 100)
 */
export function calculatePhysicalDamage(params: PhysicalAttackParams): number {
  const {
    baseDamage,
    attackerStr,
    proficiencyLevel,
    targetDefense,
    attackTypeResistance = 1.0,
    attackerPhysicalAttack = 0,
    targetPhysicalDefense,
    attackerPhysicalPenetration = 0,
  } = params;

  // 공격력: 기본 + STR 보너스 + 추가 물리공격력
  const rawDamage = baseDamage + attackerStr * 0.5 + attackerPhysicalAttack;
  const proficiencyMultiplier = getDamageMultiplier(proficiencyLevel);

  // 방어력: 신규 스탯이 있으면 사용, 없으면 기존 targetDefense
  const baseDefense = targetPhysicalDefense ?? targetDefense;

  // 관통 적용: 방어력의 일부 무시 (관통 30% = 방어력의 70%만 적용)
  const penetrationRate = Math.min(75, attackerPhysicalPenetration) / 100;
  const effectiveDefense = baseDefense * (1 - penetrationRate);

  const baseResult =
    rawDamage * proficiencyMultiplier * attackTypeResistance - effectiveDefense;
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
 * 공식: (baseDamage + INT * 0.8 + magicAttack) * proficiencyMultiplier * effectiveness * dayBoost * timeBoost * weatherBoost * karmaBoost * elementBoost * elementResist - effectiveMagicDefense
 * 관통 적용: effectiveMagicDefense = 마법방어 * (1 - 관통% / 100)
 */
export function calculateMagicDamage(params: MagicAttackParams): number {
  const {
    baseDamage,
    attackerInt,
    element,
    proficiencyLevel,
    targetDefense,
    targetElement,
    period,
    weather,
    karma,
    attackerMagicAttack = 0,
    targetMagicDefense,
    attackerElementBoost = 0,
    targetElementResist = 0,
    attackerMagicPenetration = 0,
  } = params;

  // 공격력: 기본 + INT 보너스 + 추가 마법공격력
  const rawDamage = baseDamage + attackerInt * 0.8 + attackerMagicAttack;
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
  const karmaMultiplier =
    karma !== undefined ? getKarmaElementMultiplier(element, karma) : 1.0;

  // 속성 강화 배율 (캐릭터 스탯에서 가져온 값)
  const elementBoostMultiplier = 1 + attackerElementBoost / 100;

  // 속성 저항으로 데미지 감소 (최대 75%)
  const resistPercent = Math.min(75, targetElementResist);
  const elementResistMultiplier = 1 - resistPercent / 100;

  // 마법 방어: 신규 스탯이 있으면 사용, 없으면 기존 방식 (물리방어 * 0.3)
  const baseMagicDefense = targetMagicDefense ?? targetDefense * 0.3;

  // 마법관통 적용: 마법방어의 일부 무시 (관통 30% = 방어력의 70%만 적용)
  const penetrationRate = Math.min(75, attackerMagicPenetration) / 100;
  const effectiveMagicDefense = baseMagicDefense * (1 - penetrationRate);

  const baseResult =
    rawDamage *
      proficiencyMultiplier *
      effectivenessMultiplier *
      dayBoostMultiplier *
      timeBoostMultiplier *
      weatherMultiplier *
      karmaMultiplier *
      elementBoostMultiplier *
      elementResistMultiplier -
    effectiveMagicDefense;
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

export type HitResult = "hit" | "critical" | "blocked" | "dodged" | "missed" | "weapon_blocked";

/**
 * 회피 확률 계산 (DEX 기반 + 보너스)
 * 공식: 3% + DEX * 0.4 + bonus (최대 40%)
 */
export function getDodgeChance(dex: number, bonusDodge: number = 0): number {
  const base = 3;
  const dexBonus = dex * 0.4;
  return Math.min(40, base + dexBonus + bonusDodge);
}

/**
 * 막기 확률 계산 (CON 기반 + 보너스)
 * 공식: 5% + CON * 0.3 + bonus (최대 35%)
 */
export function getBlockChance(con: number, bonusBlock: number = 0): number {
  const base = 5;
  const conBonus = con * 0.3;
  return Math.min(35, base + conBonus + bonusBlock);
}

/**
 * 빗맞음 확률 (고정 5%)
 */
export function getMissChance(): number {
  return 5;
}

/**
 * 공격 결과 판정 (확장)
 * 순서: 빗맞음 → 회피 → 무기막기 → 막기 → 치명타 → 일반 명중
 */
export interface HitResultOptions {
  attackerStats: { lck: number; dex?: number; int?: number };
  defenderStats: { dex: number; con: number };
  isPhysical?: boolean;
  // 보너스 스탯 (캐릭터 + 장비 합산)
  bonusDodge?: number;      // 추가 회피 확률
  bonusBlock?: number;      // 추가 막기 확률
  // 무기막기 (선택적)
  weaponType?: WeaponType;  // 방어자 무기 타입
  weaponProficiency?: number; // 방어자 무기 숙련도
  bonusWeaponBlock?: number; // 추가 무기막기 확률
}

export interface HitResultData {
  result: HitResult;
  damageMultiplier: number;
  critMultiplier?: number;
  // 무기막기 특수 효과 (weapon_blocked일 때)
  weaponBlockInfo?: WeaponBlockInfo;
  specialTriggered?: boolean;
  specialEffect?: WeaponBlockSpecial;
}

/**
 * 공격 결과 판정 (기본 - 하위 호환)
 */
export function determineHitResult(
  attackerStats: { lck: number; dex?: number; int?: number },
  defenderStats: { dex: number; con: number },
  isPhysical: boolean = true
): HitResultData {
  return determineHitResultEx({
    attackerStats,
    defenderStats,
    isPhysical,
  });
}

/**
 * 공격 결과 판정 (확장 - 보너스/무기막기 지원)
 */
export function determineHitResultEx(options: HitResultOptions): HitResultData {
  const {
    attackerStats,
    defenderStats,
    isPhysical = true,
    bonusDodge = 0,
    bonusBlock = 0,
    weaponType,
    weaponProficiency = 0,
    bonusWeaponBlock = 0,
  } = options;

  const roll = Math.random() * 100;
  let threshold = 0;

  // 1. 빗맞음 체크 (물리 공격만)
  if (isPhysical) {
    threshold += getMissChance();
    if (roll < threshold) {
      return { result: "missed", damageMultiplier: 0 };
    }
  }

  // 2. 회피 체크 (DEX + 보너스)
  threshold += getDodgeChance(defenderStats.dex, bonusDodge);
  if (roll < threshold) {
    return { result: "dodged", damageMultiplier: 0 };
  }

  // 3. 무기막기 체크 (무기가 있을 때만)
  if (weaponType) {
    const weaponBlockResult = attemptWeaponBlock(
      weaponType,
      defenderStats.dex,
      weaponProficiency,
      bonusWeaponBlock
    );
    if (weaponBlockResult.isBlocked) {
      return {
        result: "weapon_blocked",
        damageMultiplier: 1 - weaponBlockResult.damageReduction,
        weaponBlockInfo: weaponBlockResult.blockInfo,
        specialTriggered: weaponBlockResult.specialTriggered,
        specialEffect: weaponBlockResult.specialEffect,
      };
    }
  }

  // 4. 막기 체크 (CON + 보너스)
  threshold += getBlockChance(defenderStats.con, bonusBlock);
  if (roll < threshold) {
    return { result: "blocked", damageMultiplier: 0.5 };
  }

  // 5. 치명타 체크
  const secondaryStat = isPhysical ? (attackerStats.dex ?? 10) : (attackerStats.int ?? 10);
  const critChance = getCriticalChance(attackerStats.lck, secondaryStat);
  if (Math.random() * 100 < critChance) {
    const critMultiplier = getCriticalMultiplier(attackerStats.lck);
    return { result: "critical", damageMultiplier: critMultiplier, critMultiplier };
  }

  // 6. 일반 명중
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

// ============ 무기막기 시스템 (Weapon Block) ============

/**
 * 무기막기 결과 타입
 */
export interface WeaponBlockResult {
  isBlocked: boolean;
  blockInfo?: WeaponBlockInfo;
  damageReduction: number;   // 피해 감소율 (0-1)
  specialTriggered?: boolean;
  specialEffect?: WeaponBlockSpecial;
  counterDamage?: number;    // 반격 데미지 (counter 효과)
}

/**
 * 무기막기 확률 계산
 * 공식: 무기기본 + DEX * 0.1 + 숙련도 * 0.05 + 보너스 (최대 30%)
 */
export function getWeaponBlockChance(
  weaponType: WeaponType,
  dex: number,
  proficiencyLevel: number,
  bonus: number = 0
): number {
  const config = WEAPON_BLOCK_CONFIG[weaponType];
  const baseChance = config.blockChance;
  const dexBonus = dex * 0.1;
  const profBonus = proficiencyLevel * 0.05;
  return Math.min(30, baseChance + dexBonus + profBonus + bonus);
}

/**
 * 무기막기 시도
 * @param weaponType 방어자의 무기 타입
 * @param dex 방어자의 민첩
 * @param proficiencyLevel 해당 무기 숙련도
 * @param bonus 추가 무기막기 확률
 */
export function attemptWeaponBlock(
  weaponType: WeaponType,
  dex: number,
  proficiencyLevel: number,
  bonus: number = 0
): WeaponBlockResult {
  const config = WEAPON_BLOCK_CONFIG[weaponType];
  const blockChance = getWeaponBlockChance(weaponType, dex, proficiencyLevel, bonus);
  const roll = Math.random() * 100;

  if (roll < blockChance) {
    // 무기막기 성공
    const result: WeaponBlockResult = {
      isBlocked: true,
      blockInfo: config,
      damageReduction: config.damageReduction,
    };

    // 특수 효과 발동 체크
    if (config.specialEffect && config.specialChance) {
      const specialRoll = Math.random() * 100;
      if (specialRoll < config.specialChance) {
        result.specialTriggered = true;
        result.specialEffect = config.specialEffect;

        // 반격 효과 (counter)인 경우 - 대검 등
        if (config.specialEffect === "counter") {
          // 반격 데미지는 나중에 calculateCounterDamage에서 계산
          result.counterDamage = 0; // placeholder
        }
      }
    }

    return result;
  }

  return { isBlocked: false, damageReduction: 0 };
}

/**
 * 반격 데미지 계산 (counter 특수효과용)
 * @param blockedDamage 막은 데미지
 * @param str 공격자 힘
 * @param proficiencyLevel 무기 숙련도
 */
export function calculateCounterDamage(
  blockedDamage: number,
  str: number,
  proficiencyLevel: number
): number {
  // 반격 데미지: 막은 피해의 30% + STR * 0.2 + 숙련도 보너스
  const baseCounter = blockedDamage * 0.3;
  const strBonus = str * 0.2;
  const profBonus = 1 + proficiencyLevel * 0.005; // 숙련도 100에서 +50%
  return Math.floor((baseCounter + strBonus) * profBonus);
}

/**
 * 무기막기 특수 효과 설명 가져오기
 */
export function getWeaponBlockSpecialDescription(
  special: WeaponBlockSpecial
): { nameKo: string; description: string } {
  switch (special) {
    case "counter":
      return { nameKo: "반격", description: "막은 피해의 일부를 적에게 돌려줍니다." };
    case "riposte":
      return { nameKo: "즉시 반격", description: "막음과 동시에 빠른 반격을 가합니다." };
    case "stun":
      return { nameKo: "기절", description: "적을 1턴간 기절시킵니다." };
    case "deflect":
      return { nameKo: "마법 반사", description: "마법 공격을 일부 반사합니다." };
    case "disarm":
      return { nameKo: "무장해제", description: "적의 무기를 떨어뜨립니다." };
  }
}
