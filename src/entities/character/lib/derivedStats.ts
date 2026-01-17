import type {
  CharacterStats,
  ElementBoost,
  ElementResist,
  PhysicalResistance,
} from "../types";
import {
  DEFAULT_ELEMENT_BOOST,
  DEFAULT_ELEMENT_RESIST,
  DEFAULT_PHYSICAL_RESISTANCE,
} from "../types";
import type { EquipmentStats } from "@/entities/item";
import type { MagicElement, PhysicalAttackType } from "@/entities/ability";
import type { CharacterInjury } from "@/entities/status";
import { calculateTotalRecoveryReduction } from "@/entities/status";

// ============ 파생 스탯 인터페이스 ============

export interface DerivedCombatStats {
  // 물리 전투
  basePhysicalAttack: number; // STR * 0.5
  totalPhysicalAttack: number; // base + 캐릭터스탯 + 장비
  basePhysicalDefense: number; // CON * 0.5
  totalPhysicalDefense: number;

  // 마법 전투
  baseMagicAttack: number; // INT * 0.8
  totalMagicAttack: number;
  baseMagicDefense: number; // WIS * 0.3
  totalMagicDefense: number;

  // HP/MP
  maxHp: number;
  maxMp: number;

  // 치명타
  critChance: number;
  critDamage: number;

  // 암습
  totalAmbushChance: number;
  totalAmbushDamage: number;

  // 속성 (합산)
  totalElementBoost: ElementBoost;
  totalElementResist: ElementResist;

  // 물리 저항 (합산)
  totalPhysicalResistance: PhysicalResistance;

  // 전투 추가 스탯 (회피/막기/관통)
  totalDodgeChance: number;        // 총 회피 보너스 (최대 40%)
  totalBlockChance: number;        // 총 막기 보너스 (최대 35%)
  totalWeaponBlockChance: number;  // 총 무기막기 보너스 (최대 30%)
  totalPhysicalPenetration: number; // 총 물리관통 (최대 75%)
  totalMagicPenetration: number;    // 총 마법관통 (최대 75%)

  // 부상 관련 (마비노기 스타일)
  injuryRecoveryReduction: number; // 부상으로 인한 HP 회복 제한율 (0-0.8)
  recoverableHp: number;           // 회복 가능한 최대 HP (최대 HP는 불변, 이 값까지만 회복 가능)
}

// ============ 파생 스탯 계산 함수 ============

/**
 * 캐릭터 기본 스탯 + 장비 스탯으로 파생 전투 스탯 계산
 * @param baseStats 캐릭터 기본 스탯
 * @param equipmentStats 장비 스탯
 * @param level 캐릭터 레벨
 * @param injuries 현재 부상 목록 (선택)
 */
export function calculateDerivedStats(
  baseStats: CharacterStats,
  equipmentStats: EquipmentStats = {},
  level: number = 1,
  injuries: CharacterInjury[] = []
): DerivedCombatStats {
  // 물리 공격력: STR * 0.5 + 캐릭터스탯 + 장비 (attack → physicalAttack 합산)
  const basePhysicalAttack = Math.floor(baseStats.str * 0.5);
  const totalPhysicalAttack =
    basePhysicalAttack +
    (baseStats.physicalAttack ?? 0) +
    (equipmentStats.physicalAttack ?? 0) +
    (equipmentStats.attack ?? 0); // 레거시 스탯 합산

  // 물리 방어력: CON * 0.5 + 캐릭터스탯 + 장비 (defense → physicalDefense 합산)
  const basePhysicalDefense = Math.floor(baseStats.con * 0.5);
  const totalPhysicalDefense =
    basePhysicalDefense +
    (baseStats.physicalDefense ?? 0) +
    (equipmentStats.physicalDefense ?? 0) +
    (equipmentStats.defense ?? 0); // 레거시 스탯 합산

  // 마법 공격력: INT * 0.8 + 캐릭터스탯 + 장비 (magic → magicAttack 합산)
  const baseMagicAttack = Math.floor(baseStats.int * 0.8);
  const totalMagicAttack =
    baseMagicAttack +
    (baseStats.magicAttack ?? 0) +
    (equipmentStats.magicAttack ?? 0) +
    (equipmentStats.magic ?? 0); // 레거시 스탯 합산

  // 마법 방어력: WIS * 0.3 + 캐릭터스탯 + 장비
  const baseMagicDefense = Math.floor(baseStats.wis * 0.3);
  const totalMagicDefense =
    baseMagicDefense +
    (baseStats.magicDefense ?? 0) +
    (equipmentStats.magicDefense ?? 0);

  // HP: 50 + CON * 5 + level * 10 + 장비
  const maxHp =
    50 + baseStats.con * 5 + level * 10 + (equipmentStats.hp ?? 0);

  // MP: 20 + WIS * 3 + INT + 장비
  const maxMp =
    20 + baseStats.wis * 3 + baseStats.int + (equipmentStats.mp ?? 0);

  // 치명타 확률: 5% + LCK * 0.3 + DEX * 0.05 (최대 60%)
  const baseCritChance =
    5 + baseStats.lck * 0.3 + baseStats.dex * 0.05;
  const critChance = Math.min(
    60,
    baseCritChance + (equipmentStats.critRate ?? 0)
  );

  // 치명타 데미지: 150% + LCK * 1% + 장비
  const baseCritDamage = 150 + baseStats.lck;
  const critDamage = baseCritDamage + (equipmentStats.critDamage ?? 0);

  // 암습 확률/피해
  const totalAmbushChance =
    (baseStats.ambushChance ?? 0) + (equipmentStats.ambushChance ?? 0);
  const totalAmbushDamage =
    (baseStats.ambushDamage ?? 0) + (equipmentStats.ambushDamage ?? 0);

  // 속성 강화 합산
  const totalElementBoost: ElementBoost = {
    fire:
      (baseStats.elementBoost?.fire ?? 0) + (equipmentStats.fireBoost ?? 0),
    ice:
      (baseStats.elementBoost?.ice ?? 0) + (equipmentStats.iceBoost ?? 0),
    lightning:
      (baseStats.elementBoost?.lightning ?? 0) +
      (equipmentStats.lightningBoost ?? 0),
    earth:
      (baseStats.elementBoost?.earth ?? 0) +
      (equipmentStats.earthBoost ?? 0),
    holy:
      (baseStats.elementBoost?.holy ?? 0) + (equipmentStats.holyBoost ?? 0),
    dark:
      (baseStats.elementBoost?.dark ?? 0) + (equipmentStats.darkBoost ?? 0),
    poison:
      (baseStats.elementBoost?.poison ?? 0) +
      (equipmentStats.poisonBoost ?? 0),
    arcane:
      (baseStats.elementBoost?.arcane ?? 0) +
      (equipmentStats.arcaneBoost ?? 0),
  };

  // 속성 저항 합산
  const totalElementResist: ElementResist = {
    fire:
      (baseStats.elementResist?.fire ?? 0) + (equipmentStats.fireResist ?? 0),
    ice:
      (baseStats.elementResist?.ice ?? 0) + (equipmentStats.iceResist ?? 0),
    lightning:
      (baseStats.elementResist?.lightning ?? 0) +
      (equipmentStats.lightningResist ?? 0),
    earth:
      (baseStats.elementResist?.earth ?? 0) +
      (equipmentStats.earthResist ?? 0),
    holy:
      (baseStats.elementResist?.holy ?? 0) + (equipmentStats.holyResist ?? 0),
    dark:
      (baseStats.elementResist?.dark ?? 0) + (equipmentStats.darkResist ?? 0),
    poison:
      (baseStats.elementResist?.poison ?? 0) +
      (equipmentStats.poisonResist ?? 0),
    arcane:
      (baseStats.elementResist?.arcane ?? 0) +
      (equipmentStats.arcaneResist ?? 0),
  };

  // 물리 저항 합산 (캐릭터 기본 저항 + 장비 보너스)
  // 저항은 배율: 1.0 = 보통, 0.5 = 강함, 1.5 = 약함
  // 장비 보너스는 배율 감소: -0.1 = 10% 추가 저항
  const totalPhysicalResistance: PhysicalResistance = {
    slashResist:
      (baseStats.physicalResistance?.slashResist ?? DEFAULT_PHYSICAL_RESISTANCE.slashResist) +
      (equipmentStats.slashResistBonus ?? 0),
    pierceResist:
      (baseStats.physicalResistance?.pierceResist ?? DEFAULT_PHYSICAL_RESISTANCE.pierceResist) +
      (equipmentStats.pierceResistBonus ?? 0),
    crushResist:
      (baseStats.physicalResistance?.crushResist ?? DEFAULT_PHYSICAL_RESISTANCE.crushResist) +
      (equipmentStats.crushResistBonus ?? 0),
  };

  // 전투 추가 스탯 (회피/막기/관통)
  // 회피: 캐릭터 보너스 + 장비 (최대 40%)
  const totalDodgeChance = Math.min(
    40,
    (baseStats.dodgeChance ?? 0) + (equipmentStats.dodgeChance ?? 0)
  );

  // 막기: 캐릭터 보너스 + 장비 (최대 35%)
  const totalBlockChance = Math.min(
    35,
    (baseStats.blockChance ?? 0) + (equipmentStats.blockChance ?? 0)
  );

  // 무기막기: 캐릭터 보너스 + 장비 (최대 30%)
  const totalWeaponBlockChance = Math.min(
    30,
    (baseStats.weaponBlockChance ?? 0) + (equipmentStats.weaponBlockChance ?? 0)
  );

  // 물리관통: 캐릭터 보너스 + 장비 (최대 75%)
  const totalPhysicalPenetration = Math.min(
    75,
    (baseStats.physicalPenetration ?? 0) + (equipmentStats.physicalPenetration ?? 0)
  );

  // 마법관통: 캐릭터 보너스 + 장비 (최대 75%)
  const totalMagicPenetration = Math.min(
    75,
    (baseStats.magicPenetration ?? 0) + (equipmentStats.magicPenetration ?? 0)
  );

  // 부상으로 인한 HP 회복 제한 계산 (마비노기 스타일)
  // maxHp는 불변, recoverableHp만 감소 (이 값까지만 포션 등으로 회복 가능)
  const injuryRecoveryReduction = calculateTotalRecoveryReduction(injuries);
  const recoverableHp = Math.floor(maxHp * (1 - injuryRecoveryReduction));

  return {
    basePhysicalAttack,
    totalPhysicalAttack,
    basePhysicalDefense,
    totalPhysicalDefense,
    baseMagicAttack,
    totalMagicAttack,
    baseMagicDefense,
    totalMagicDefense,
    maxHp,
    maxMp,
    critChance,
    critDamage,
    totalAmbushChance,
    totalAmbushDamage,
    totalElementBoost,
    totalElementResist,
    totalPhysicalResistance,
    totalDodgeChance,
    totalBlockChance,
    totalWeaponBlockChance,
    totalPhysicalPenetration,
    totalMagicPenetration,
    injuryRecoveryReduction,
    recoverableHp,
  };
}

// ============ 유틸리티 함수 ============

/**
 * 특정 속성의 총 강화율을 배율로 변환 (예: 10% → 1.1)
 */
export function getElementBoostMultiplier(
  element: MagicElement,
  boost: ElementBoost
): number {
  return 1 + (boost[element] ?? 0) / 100;
}

/**
 * 특정 속성의 저항율로 데미지 감소 배율 계산
 * 저항 50% = 데미지 50% 감소 (배율 0.5)
 * 최대 저항: 75%
 */
export function getElementResistReduction(
  element: MagicElement,
  resist: ElementResist
): number {
  const resistPercent = Math.min(75, resist[element] ?? 0); // 최대 75% 감소
  return 1 - resistPercent / 100;
}

/**
 * 마법 데미지에 적용할 속성 배율 계산
 * (속성 강화 * 속성 저항 감소)
 */
export function getElementDamageMultiplier(
  element: MagicElement,
  attackerBoost: ElementBoost,
  targetResist: ElementResist
): number {
  const boostMultiplier = getElementBoostMultiplier(element, attackerBoost);
  const resistReduction = getElementResistReduction(element, targetResist);
  return boostMultiplier * resistReduction;
}

/**
 * 캐릭터의 특정 물리 공격 타입에 대한 저항 배율 가져오기
 * @param resistance 물리 저항 스탯
 * @param attackType 공격 타입 (slash/pierce/crush)
 * @returns 저항 배율 (1.0 = 보통, 0.5 = 강함, 1.5 = 약함)
 */
export function getCharacterPhysicalResistance(
  resistance: PhysicalResistance | undefined,
  attackType: PhysicalAttackType
): number {
  const res = resistance ?? DEFAULT_PHYSICAL_RESISTANCE;

  switch (attackType) {
    case "slash":
      return res.slashResist;
    case "pierce":
      return res.pierceResist;
    case "crush":
      return res.crushResist;
    default:
      return 1.0;
  }
}
