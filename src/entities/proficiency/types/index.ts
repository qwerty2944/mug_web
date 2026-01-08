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

export type MagicElement =
  | "fire"
  | "ice"
  | "lightning"
  | "earth"
  | "holy"
  | "dark"
  | "poison"; // 독속성

// ============ 생활 스킬 타입 ============

// 제작 스킬 (5종)
export type CraftingType =
  | "blacksmithing"   // 대장장이 - 무기/방어구 제작
  | "tailoring"       // 재봉 - 천/가죽 장비 제작
  | "cooking"         // 요리 - 음식 버프 아이템
  | "alchemy"         // 연금 - 포션/물약 제작
  | "jewelcrafting";  // 보석세공 - 악세서리 제작

// 의료 스킬 (3종)
export type MedicalType =
  | "first_aid"       // 붕대/응급처치 - 경상 치료
  | "herbalism"       // 약초학 - 중상 치료 + 허브 채집
  | "surgery";        // 수술 - 치명상 치료

// 지식 스킬 (4종) - 패시브 전투 보너스
export type KnowledgeType =
  | "anatomy"         // 해부학 - 베기/찌르기 데미지 증가
  | "metallurgy"      // 금속학 - 타격 데미지 + 방어력 증가
  | "botany"          // 식물학 - 독/치유 효과 증가
  | "gemology";       // 보석학 - 마법 데미지 증가

// 생활 스킬 통합
export type LifeSkillType = CraftingType | MedicalType | KnowledgeType;

// ============ 숙련도 타입 ============

// 전투 숙련도 (기존)
export type CombatProficiencyType = WeaponType | MagicElement;

// 전체 숙련도 (전투 + 생활)
export type ProficiencyType = CombatProficiencyType | LifeSkillType;

export type ProficiencyCategory = "weapon" | "magic" | "crafting" | "medical" | "knowledge";

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
  light_sword: number; // 세검
  medium_sword: number; // 중검
  great_sword: number; // 대검
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
  poison: number; // 독속성 숙련
  // 제작 스킬 숙련
  blacksmithing: number;  // 대장장이
  tailoring: number;      // 재봉
  cooking: number;        // 요리
  alchemy: number;        // 연금
  jewelcrafting: number;  // 보석세공
  // 의료 스킬 숙련
  first_aid: number;      // 응급처치
  herbalism: number;      // 약초학
  surgery: number;        // 수술
  // 지식 스킬 숙련
  anatomy: number;        // 해부학
  metallurgy: number;     // 금속학
  botany: number;         // 식물학
  gemology: number;       // 보석학
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
  strong: MagicElement | null; // null = 특별히 강한 속성 없음
  weak: MagicElement | null; // null = 특별히 약한 속성 없음
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
