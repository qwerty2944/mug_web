import type { CharacterStats } from "@/entities/character";

// ============ 무기 타입 ============

export type WeaponType =
  | "light_sword"   // 세검
  | "medium_sword"  // 중검
  | "great_sword"   // 대검
  | "axe"
  | "mace"
  | "dagger"
  | "spear"
  | "bow"
  | "crossbow"
  | "staff"
  | "fist";

// ============ 마법 속성 ============

export type MagicElement = "fire" | "ice" | "lightning" | "earth" | "holy" | "dark";

// ============ 숙련도 타입 ============

export type ProficiencyType = WeaponType | MagicElement;

export type ProficiencyCategory = "weapon" | "magic";

// ============ 숙련도 등급 ============

export type ProficiencyRank =
  | "novice"
  | "apprentice"
  | "journeyman"
  | "expert"
  | "master"
  | "grandmaster";

// ============ 숙련도 데이터 ============

export interface Proficiencies {
  // 무기 숙련
  light_sword: number;   // 세검
  medium_sword: number;  // 중검
  great_sword: number;   // 대검
  axe: number;
  mace: number;
  dagger: number;
  spear: number;
  bow: number;
  crossbow: number;
  staff: number;
  fist: number;
  // 마법 숙련
  fire: number;
  ice: number;
  lightning: number;
  earth: number;
  holy: number;
  dark: number;
}

// ============ 메타 정보 ============

export interface ProficiencyInfo {
  id: ProficiencyType;
  nameKo: string;
  nameEn: string;
  category: ProficiencyCategory;
  relatedStats: (keyof CharacterStats)[];
  description: string;
  icon: string;
}

export interface RankInfo {
  id: ProficiencyRank;
  min: number;
  max: number;
  nameKo: string;
  nameEn: string;
  damageBonus: number;
  speedBonus: number;
}

export interface MagicEffectiveness {
  strong: MagicElement;
  weak: MagicElement;
}

// ============ 공격 타입 ============

export type AttackType = "slash" | "pierce" | "crush";

export interface AttackTypeInfo {
  id: AttackType;
  nameKo: string;
  nameEn: string;
  icon: string;
  description: string;
}
