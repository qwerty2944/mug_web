import type { MagicElement } from "@/entities/proficiency";

// ============ 주문 타입 ============

export type SpellType =
  | "attack"    // 공격 주문
  | "heal"      // 치유 주문
  | "buff"      // 버프 주문
  | "debuff"    // 디버프 주문
  | "dot"       // 지속 피해 (Damage over Time)
  | "special";  // 특수 효과 (즉사, 석화 등)

// 주문 대상
export type SpellTarget =
  | "enemy"         // 적
  | "self"          // 자신
  | "ally"          // 아군 (파티원)
  | "all_enemies"   // 모든 적
  | "all_allies";   // 모든 아군

// ============ 주문 요구 조건 ============

export interface SpellRequirements {
  proficiency?: number;      // 해당 속성 숙련도 레벨
  karma?: number;            // 양수: 이상, 음수: 이하 (예: -30 = 카르마 -30 이하)
  piety?: number;            // 신앙심 레벨
  religion?: string;         // 특정 종교 필수 (예: "solara")
}

// ============ 주문 효과 ============

export interface SpellEffect {
  // DoT 효과
  type?: string;             // burn, bleed, poison 등
  duration?: number;         // 지속 턴 수
  damagePerTurn?: number;    // 턴당 피해

  // 버프/디버프 효과
  statModifier?: {           // 스탯 변경
    stat: string;            // str, dex, con 등
    value: number;           // 변경량 (음수 = 감소)
    percent?: boolean;       // 퍼센트 여부
  };
  iceResist?: number;        // 냉기 저항 (0.5 = -50%)
  fireResist?: number;       // 화염 저항
  physicalResist?: number;   // 물리 저항
  reflectDamage?: number;    // 반사 피해

  // 특수 효과
  castTime?: number;         // 캐스팅 시간 (턴)
  selfDamage?: number;       // 자해 피해
  instantKillChance?: number; // 즉사 확률 (0-1)
  stunChance?: number;       // 스턴 확률
  stunDuration?: number;     // 스턴 지속
  freezeChance?: number;     // 동결 확률
  slowDuration?: number;     // 슬로우 지속
  speedReduction?: number;   // 속도 감소량

  // 힐 효과
  healPercent?: number;      // HP% 회복
  hotDuration?: number;      // 지속 회복 턴
  hotPercent?: number;       // 턴당 회복 %

  // 드레인 효과
  lifesteal?: number;        // 흡혈 비율 (0.5 = 50%)

  // 조건부
  bonusVsType?: {            // 특정 타입에 보너스
    type: string;            // undead, demon 등
    multiplier: number;      // 배율
  };
}

// ============ 주문 설명 ============

export interface SpellDescription {
  ko: string;
  en: string;
}

// ============ 주문 데이터 ============

export interface Spell {
  id: string;
  nameKo: string;
  nameEn: string;
  element: MagicElement;
  type: SpellType;

  // 기본 수치
  baseDamage: number;        // 기본 피해 (힐의 경우 0)
  mpCost: number;            // MP 소모량
  cooldown: number;          // 쿨다운 (턴)

  // 요구 조건
  requirements: SpellRequirements;

  // 효과
  effect?: SpellEffect;

  // 대상 (기본: 공격=enemy, 힐=self)
  target?: SpellTarget;

  // 메타데이터
  icon: string;
  description: SpellDescription;
}

// ============ JSON 데이터 구조 ============

export interface SpellsData {
  version: string;
  generatedAt: string;
  spells: Spell[];
  summary: {
    total: number;
    byElement: Record<string, number>;
    byType: Record<string, number>;
  };
}

// ============ 주문 숙련도 ============

export interface SpellProficiency {
  userId: string;
  spellId: string;
  experience: number;        // 0-100
  castCount: number;         // 총 사용 횟수
  lastCastAt: string | null; // 마지막 사용 시간
}

// 숙련도 등급
export type SpellProficiencyRank =
  | "unskilled"     // 미숙 (0-19)
  | "familiar"      // 익숙 (20-39)
  | "skilled"       // 숙련 (40-59)
  | "proficient"    // 정통 (60-79)
  | "master"        // 달인 (80-99)
  | "grandmaster";  // 대가 (100)

export interface SpellProficiencyRankInfo {
  id: SpellProficiencyRank;
  nameKo: string;
  nameEn: string;
  minExp: number;
  maxExp: number;
  damageBonus: number;       // 데미지 보너스 (0.05 = +5%)
  mpReduction: number;       // MP 감소 (0.05 = -5%)
  cooldownReduction: number; // 쿨다운 감소 (턴)
}

// 숙련도 등급 정의
export const SPELL_PROFICIENCY_RANKS: SpellProficiencyRankInfo[] = [
  {
    id: "unskilled",
    nameKo: "미숙",
    nameEn: "Unskilled",
    minExp: 0,
    maxExp: 19,
    damageBonus: 0,
    mpReduction: 0,
    cooldownReduction: 0,
  },
  {
    id: "familiar",
    nameKo: "익숙",
    nameEn: "Familiar",
    minExp: 20,
    maxExp: 39,
    damageBonus: 0.05,
    mpReduction: 0.05,
    cooldownReduction: 0,
  },
  {
    id: "skilled",
    nameKo: "숙련",
    nameEn: "Skilled",
    minExp: 40,
    maxExp: 59,
    damageBonus: 0.1,
    mpReduction: 0.1,
    cooldownReduction: 0,
  },
  {
    id: "proficient",
    nameKo: "정통",
    nameEn: "Proficient",
    minExp: 60,
    maxExp: 79,
    damageBonus: 0.15,
    mpReduction: 0.15,
    cooldownReduction: 1,
  },
  {
    id: "master",
    nameKo: "달인",
    nameEn: "Master",
    minExp: 80,
    maxExp: 99,
    damageBonus: 0.2,
    mpReduction: 0.2,
    cooldownReduction: 1,
  },
  {
    id: "grandmaster",
    nameKo: "대가",
    nameEn: "Grandmaster",
    minExp: 100,
    maxExp: 100,
    damageBonus: 0.25,
    mpReduction: 0.25,
    cooldownReduction: 2,
  },
];

// ============ 속성별 카테고리 ============

export type SpellCategory =
  | "fire"        // 화염
  | "ice"         // 냉기
  | "lightning"   // 번개
  | "earth"       // 대지
  | "holy"        // 신성
  | "dark"        // 암흑
  | "heal";       // 치유 (특수)

export interface SpellCategoryInfo {
  id: SpellCategory;
  nameKo: string;
  nameEn: string;
  icon: string;
  element: MagicElement | null;  // heal은 null
}

export const SPELL_CATEGORIES: SpellCategoryInfo[] = [
  { id: "fire", nameKo: "화염", nameEn: "Fire", icon: "🔥", element: "fire" },
  { id: "ice", nameKo: "냉기", nameEn: "Ice", icon: "❄️", element: "ice" },
  { id: "lightning", nameKo: "번개", nameEn: "Lightning", icon: "⚡", element: "lightning" },
  { id: "earth", nameKo: "대지", nameEn: "Earth", icon: "🪨", element: "earth" },
  { id: "holy", nameKo: "신성", nameEn: "Holy", icon: "✨", element: "holy" },
  { id: "dark", nameKo: "암흑", nameEn: "Dark", icon: "🌑", element: "dark" },
  { id: "heal", nameKo: "치유", nameEn: "Heal", icon: "💚", element: null },
];
