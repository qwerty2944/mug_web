/**
 * Trait System Types
 * 크루세이더 킹즈 스타일 특성 시스템
 */

// ============ 카테고리 ============
export type TraitCategory =
  | "appearance" // 외모
  | "personality" // 성격
  | "health" // 건강
  | "talent" // 재능
  | "misc"; // 기타

export const TRAIT_CATEGORY_ORDER: TraitCategory[] = [
  "appearance",
  "personality",
  "health",
  "talent",
  "misc",
];

export const TRAIT_CATEGORIES: Record<
  TraitCategory,
  { nameKo: string; nameEn: string; icon: string; description: string }
> = {
  appearance: {
    nameKo: "외모",
    nameEn: "Appearance",
    icon: "👁️",
    description: "캐릭터의 외형적 특징",
  },
  personality: {
    nameKo: "성격",
    nameEn: "Personality",
    icon: "💭",
    description: "캐릭터의 성격과 기질",
  },
  health: {
    nameKo: "건강",
    nameEn: "Health",
    icon: "❤️",
    description: "신체적 건강 상태",
  },
  talent: {
    nameKo: "재능",
    nameEn: "Talent",
    icon: "⭐",
    description: "타고난 재능과 능력",
  },
  misc: {
    nameKo: "기타",
    nameEn: "Miscellaneous",
    icon: "✨",
    description: "특수한 배경이나 상태",
  },
};

// ============ 희귀도 ============
export type TraitRarity =
  | "common" // 일반
  | "uncommon" // 비범
  | "rare" // 희귀
  | "legendary"; // 전설

export const TRAIT_RARITIES: Record<
  TraitRarity,
  { nameKo: string; color: string; weight: number }
> = {
  common: { nameKo: "일반", color: "#9CA3AF", weight: 1.0 },
  uncommon: { nameKo: "비범", color: "#22C55E", weight: 0.5 },
  rare: { nameKo: "희귀", color: "#3B82F6", weight: 0.2 },
  legendary: { nameKo: "전설", color: "#F59E0B", weight: 0.05 },
};

// ============ 스탯 타입 ============
export type StatType = "str" | "dex" | "con" | "int" | "wis" | "cha" | "lck";

// ============ 특수 효과 ============
export type SpecialEffectType =
  // 저항/취약
  | "fear_resistance" // 공포 저항
  | "disease_resistance" // 질병 저항
  | "poison_resistance" // 독 저항
  | "fire_resistance" // 화염 저항
  | "ice_resistance" // 냉기 저항
  | "lightning_resistance" // 번개 저항
  | "holy_resistance" // 신성 저항
  | "dark_resistance" // 암흑 저항
  // 전투 보너스
  | "physical_damage" // 물리 데미지
  | "magic_damage" // 마법 데미지
  | "critical_chance" // 치명타 확률
  | "dodge_chance" // 회피 확률
  | "block_chance" // 막기 확률
  | "accuracy" // 명중률
  | "flee_chance" // 도주 확률
  // 경제/성장
  | "gold_gain" // 골드 획득량
  | "exp_gain" // 경험치 획득량
  | "rare_drop" // 희귀 드롭률
  | "proficiency_gain" // 숙련도 획득
  // 특수
  | "dual_wield" // 이도류 보너스
  | "healing_power" // 치유량
  | "purchase_cost" // 구매 비용
  | "intimidation" // 위협
  | "persuasion" // 설득
  | "night_bonus" // 밤 보너스
  | "day_bonus"; // 낮 보너스

export interface SpecialEffect {
  type: SpecialEffectType;
  value: number; // 백분율 또는 고정값
  isPercentage: boolean;
}

// ============ NPC 반응 ============
export type NPCReactionType =
  | "noble" // 귀족
  | "commoner" // 평민
  | "merchant" // 상인
  | "guard" // 경비병
  | "priest" // 사제
  | "criminal" // 범죄자
  | "monster"; // 몬스터

export interface NPCReaction {
  type: NPCReactionType;
  modifier: number; // 호감도 수정 (-100 ~ +100)
}

// ============ 자동감지 조건 ============
export type RequirementType =
  | "stat" // 스탯 조건
  | "appearance" // 외형 조건
  | "handedness" // 손잡이
  | "event" // 이벤트 획득
  | "birth" // 생성시 자동
  | "hidden"; // 히든 조건

export type HandednessType = "right" | "left" | "ambidextrous";

// 외형 조건 상세
export interface AppearanceCondition {
  type: "odd_eyes" | "body_type" | "hair_color" | "scar";
  value?: string | number;
}

// 스탯 조건 상세
export interface StatCondition {
  stat: StatType;
  operator: ">=" | "<=" | "==" | ">";
  value: number;
}

export interface TraitRequirement {
  type: RequirementType;
  // 스탯 조건
  stat?: StatCondition;
  // 외형 조건
  appearance?: AppearanceCondition;
  // 손잡이 조건
  handedness?: HandednessType;
  // 설명
  description?: string;
}

// ============ 트레이트 충돌 ============
export interface TraitConflict {
  traitId: string;
  reason: string;
}

// ============ 트레이트 효과 ============
export interface TraitEffects {
  // 스탯 보너스
  statModifiers?: Partial<Record<StatType, number>>;
  // 특수 효과
  specialEffects?: SpecialEffect[];
  // NPC 반응
  npcReactions?: NPCReaction[];
  // 해금 스킬
  unlockedSkills?: string[];
}

// ============ 메인 트레이트 타입 ============
export interface Trait {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string;
  icon: string;
  category: TraitCategory;
  rarity: TraitRarity;
  // 효과
  effects: TraitEffects;
  // 획득 조건
  requirements?: TraitRequirement[];
  // 충돌 트레이트
  conflicts?: TraitConflict[];
  // 숨김 여부 (조건 미충족시 목록에 표시 안함)
  hidden?: boolean;
}

// ============ 캐릭터 보유 트레이트 ============
export type TraitSource = "birth" | "event" | "achievement" | "quest";

export interface CharacterTrait {
  id: string;
  traitId: string;
  userId: string;
  acquiredAt: string;
  source: TraitSource;
  sourceDetail?: string;
  isActive: boolean;
}

// ============ 집계된 효과 ============
export interface AggregatedTraitEffects {
  statModifiers: Partial<Record<StatType, number>>;
  specialEffects: Map<SpecialEffectType, number>;
  npcReactions: Map<NPCReactionType, number>;
  unlockedSkills: string[];
}
