/**
 * Ability System - 스펠과 스킬을 통합한 어빌리티 시스템
 * 모든 전투 행동(물리 공격, 마법, 버프, 디버프 등)을 하나의 Ability로 관리
 */

import type { StatusType } from "@/entities/status";

// ============ 무기 타입 ============
export type WeaponType =
  | "light_sword"
  | "medium_sword"
  | "great_sword"
  | "axe"
  | "mace"
  | "dagger"
  | "spear"
  | "bow"
  | "crossbow"
  | "staff"
  | "fist"
  | "shield";

// ============ 마법 속성 ============
export type MagicElement = "fire" | "ice" | "lightning" | "earth" | "holy" | "dark" | "poison" | "arcane";

// ============ 생활/제작 스킬 타입 ============
export type MedicalType = "first_aid" | "herbalism" | "surgery";
export type KnowledgeType = "anatomy" | "metallurgy" | "botany" | "gemology";
export type CraftingType = "blacksmithing" | "tailoring" | "cooking" | "alchemy" | "jewelcrafting";
export type LifeSkillType = MedicalType | KnowledgeType | CraftingType;

// ============ 물리 공격 타입 (데미지 계산용) ============
export type PhysicalAttackType = "slash" | "pierce" | "blunt" | "crush";

// ============ 숙련도 타입 ============
export type CombatProficiencyType = WeaponType | MagicElement;
export type ProficiencyType = CombatProficiencyType | MedicalType | KnowledgeType;

// ============ 숙련도 정보 ============
export interface ProficiencyInfo {
  id: string;
  nameKo: string;
  nameEn: string;
  icon: string;
  category: "weapon" | "magic" | "medical" | "knowledge";
}

// ============ 숙련도 값 ============
export interface Proficiencies {
  light_sword: number;
  medium_sword: number;
  great_sword: number;
  axe: number;
  mace: number;
  dagger: number;
  spear: number;
  bow: number;
  crossbow: number;
  staff: number;
  fist: number;
  shield: number;
  fire: number;
  ice: number;
  lightning: number;
  earth: number;
  holy: number;
  dark: number;
  poison: number;
  arcane: number;
}

// ============ 무기 블록 ============
export type WeaponBlockEffectType = "counter" | "riposte" | "disarm" | "stun" | "deflect" | "none";
export type WeaponBlockSpecial = WeaponBlockEffectType;

export interface WeaponBlockConfig {
  blockChance: number;
  damageReduction: number;
  specialEffect?: WeaponBlockEffectType;
  specialChance?: number;
}

export type WeaponBlockInfo = WeaponBlockConfig;

// 어빌리티 소스 (어디서 온 데이터인지)
export type AbilitySource = "spell" | "combatskill" | "monster";

// 어빌리티 타입 (주요 효과)
export type AbilityType =
  | "passive"       // 패시브 (항상 적용)
  | "attack"        // 공격
  | "heal"          // 치유
  | "buff"          // 자신/아군 버프
  | "debuff"        // 적 디버프
  | "dot"           // 지속 피해
  | "special"       // 특수 효과 (즉사, 석화 등)
  | "utility"       // 유틸리티 (분석, 이동 등)
  | "defense";      // 방어 (가드, 회피 등)

// 공격 타입 (데미지 계산 방식)
export type AttackType =
  | "melee_physical"   // 근접 물리 (STR/DEX)
  | "ranged_physical"  // 원거리 물리 (DEX)
  | "magic";           // 마법 (INT/WIS)

// 타겟 타입
export type TargetType = "self" | "enemy" | "all_enemies" | "all_allies";

// 레벨 보너스 효과
export interface AbilityLevelEffects {
  baseDamage?: number;
  apCost?: number;
  mpCost?: number;

  // 치유
  healAmount?: number;          // 고정 치유량
  healPercent?: number;
  healPercentPerTurn?: number;
  duration?: number;

  // 상태이상 부여
  statusEffect?: string;        // 부여할 상태이상 타입
  statusValue?: number;         // 상태이상 값
  statusDuration?: number;      // 상태이상 지속 턴
  statusChance?: number;        // 상태이상 발동 확률 (%)

  // 개별 상태이상 (레거시)
  bleedDamage?: number;
  bleedDuration?: number;
  poisonDamage?: number;
  burnDamage?: number;
  stunDuration?: number;
  stunChance?: number;
  slowPercent?: number;
  freezeChance?: number;
  freezeDuration?: number;
  knockdownChance?: number;
  blindChance?: number;

  // 방어 보너스
  blockBonus?: number;          // 막기 확률 보너스 (%)
  dodgeBonus?: number;          // 회피 확률 보너스 (%)
  counterChance?: number;       // 반격 확률 (%)
  damageReduction?: number;     // 피해 감소율 (%)

  // 공격 보너스
  armorBreak?: number;
  armorReduction?: number;
  damageAmplify?: number;
  physicalResist?: number;
  magicResist?: number;
  defenseBonus?: number;
  attackReduction?: number;
  lifestealPercent?: number;
  critBonus?: number;
  hitCount?: [number, number];  // [min, max]

  // 기타
  aoe?: boolean;
  castTime?: number;
  selfDamage?: number;

  // 속성별 데미지 보너스 (패시브용)
  fireDamage?: number;
  iceDamage?: number;
  lightningDamage?: number;
  earthDamage?: number;
  holyDamage?: number;
  darkDamage?: number;
  axeDamage?: number;
  swordDamage?: number;
  [key: string]: number | boolean | string | [number, number] | undefined;
}

// 레벨 보너스
export interface AbilityLevelBonus {
  level: number;
  effects: AbilityLevelEffects;
}

// 요구 조건
export interface AbilityRequirements {
  skills?: Record<string, number>;   // 다른 스킬 레벨 요구
  stats?: {
    str?: number;
    dex?: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
    lck?: number;
  };
  karma?: number;      // 양수: 이상, 음수: 이하
  piety?: number;      // 신앙심 레벨
  religion?: string;   // 특정 종교 필수
  equipment?: string;  // 필요 장비
}

// 통합 어빌리티 타입
export interface Ability {
  id: string;
  nameKo: string;
  nameEn: string;
  description: {
    ko: string;
    en: string;
  };
  icon: string;

  // 분류
  source: AbilitySource;        // spell | combatskill
  type: AbilityType;            // attack, heal, buff 등
  attackType?: AttackType;      // attack 타입일 때만
  element?: MagicElement;       // 마법 속성 (spell일 때)
  category?: string;            // weapon, martial, defense 등 (skill일 때)
  skillGroup?: string;          // weapon, martial, utility 등

  // 사용 컨텍스트
  usageContext: "passive" | "combat_only" | "field_only" | "both";

  // 레벨/숙련도
  maxLevel: number;
  expPerLevel: number;
  levelBonuses: AbilityLevelBonus[];

  // 비용 (기본값, 레벨 보너스로 변경 가능)
  baseCost: {
    ap?: number;    // 액션 포인트 (물리 스킬)
    mp?: number;    // 마나 포인트 (마법)
  };

  // 쿨다운
  cooldown?: number;

  // 요구 조건
  requirements: AbilityRequirements;

  // 경험치 부여 대상 (다른 스킬에 경험치 부여)
  grantsExpTo?: string[];

  // 타겟
  target?: TargetType;
}

// 전투용 어빌리티 인스턴스 (큐에 들어가는 형태)
export interface QueuedAbility {
  ability: Ability;
  abilityLevel: number;       // 플레이어의 해당 어빌리티 레벨
  effects: AbilityLevelEffects; // 현재 레벨의 효과
  targetId?: string;          // 대상 ID (optional)
}

// 전투 액션 큐
export interface ActionQueue {
  actions: QueuedAbility[];
  totalApUsed: number;
  maxAp: number;
}

// 몬스터 어빌리티 (간소화)
export interface MonsterAbility {
  abilityId: string;
  level: number;
  weight: number;    // AI 선택 가중치 (높을수록 자주 사용)
  condition?: {
    hpBelow?: number;    // HP가 n% 이하일 때만
    hpAbove?: number;    // HP가 n% 이상일 때만
    turnAfter?: number;  // n턴 이후에만
  };
}
