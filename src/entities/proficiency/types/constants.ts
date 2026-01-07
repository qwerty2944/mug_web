import type {
  ProficiencyInfo,
  RankInfo,
  MagicElement,
  MagicEffectiveness,
  WeaponType,
  AttackType,
  AttackTypeInfo,
} from "./index";

// ============ 무기 숙련 정보 ============

export const WEAPON_PROFICIENCIES: ProficiencyInfo[] = [
  {
    id: "light_sword",
    nameKo: "세검",
    nameEn: "Light Sword",
    category: "weapon",
    relatedStats: ["dex"],
    description: "빠르고 정밀한 찌르기",
    icon: "🗡️",
  },
  {
    id: "medium_sword",
    nameKo: "중검",
    nameEn: "Medium Sword",
    category: "weapon",
    relatedStats: ["str", "dex"],
    description: "균형 잡힌 베기",
    icon: "⚔️",
  },
  {
    id: "great_sword",
    nameKo: "대검",
    nameEn: "Great Sword",
    category: "weapon",
    relatedStats: ["str"],
    description: "강력한 베기, 패리 가능",
    icon: "🗡️",
  },
  {
    id: "axe",
    nameKo: "도끼",
    nameEn: "Axe",
    category: "weapon",
    relatedStats: ["str"],
    description: "높은 데미지, 느린 속도",
    icon: "🪓",
  },
  {
    id: "mace",
    nameKo: "둔기",
    nameEn: "Mace",
    category: "weapon",
    relatedStats: ["str"],
    description: "방어 관통, 스턴",
    icon: "🔨",
  },
  {
    id: "dagger",
    nameKo: "단검",
    nameEn: "Dagger",
    category: "weapon",
    relatedStats: ["dex"],
    description: "빠른 속도, 치명타",
    icon: "🗡️",
  },
  {
    id: "spear",
    nameKo: "창",
    nameEn: "Spear",
    category: "weapon",
    relatedStats: ["str", "dex"],
    description: "긴 사거리",
    icon: "🔱",
  },
  {
    id: "bow",
    nameKo: "활",
    nameEn: "Bow",
    category: "weapon",
    relatedStats: ["dex"],
    description: "원거리 물리",
    icon: "🏹",
  },
  {
    id: "crossbow",
    nameKo: "석궁",
    nameEn: "Crossbow",
    category: "weapon",
    relatedStats: ["dex"],
    description: "높은 관통력",
    icon: "🎯",
  },
  {
    id: "staff",
    nameKo: "지팡이",
    nameEn: "Staff",
    category: "weapon",
    relatedStats: ["int", "wis"],
    description: "마법 증폭",
    icon: "🪄",
  },
  {
    id: "fist",
    nameKo: "격투",
    nameEn: "Martial Arts",
    category: "weapon",
    relatedStats: ["str", "dex"],
    description: "맨손 전투, 빠른 연타",
    icon: "👊",
  },
];

// ============ 마법 숙련 정보 ============

export const MAGIC_PROFICIENCIES: ProficiencyInfo[] = [
  {
    id: "fire",
    nameKo: "화염",
    nameEn: "Fire",
    category: "magic",
    relatedStats: ["int"],
    description: "화염 계열 마법",
    icon: "🔥",
  },
  {
    id: "ice",
    nameKo: "냉기",
    nameEn: "Ice",
    category: "magic",
    relatedStats: ["int"],
    description: "냉기 계열 마법",
    icon: "❄️",
  },
  {
    id: "lightning",
    nameKo: "번개",
    nameEn: "Lightning",
    category: "magic",
    relatedStats: ["int"],
    description: "번개 계열 마법",
    icon: "⚡",
  },
  {
    id: "earth",
    nameKo: "대지",
    nameEn: "Earth",
    category: "magic",
    relatedStats: ["int", "con"],
    description: "대지 계열 마법",
    icon: "🪨",
  },
  {
    id: "holy",
    nameKo: "신성",
    nameEn: "Holy",
    category: "magic",
    relatedStats: ["wis"],
    description: "신성 계열 마법",
    icon: "✨",
  },
  {
    id: "dark",
    nameKo: "암흑",
    nameEn: "Dark",
    category: "magic",
    relatedStats: ["int"],
    description: "암흑 계열 마법",
    icon: "🌑",
  },
];

// ============ 모든 숙련 정보 ============

export const ALL_PROFICIENCIES: ProficiencyInfo[] = [
  ...WEAPON_PROFICIENCIES,
  ...MAGIC_PROFICIENCIES,
];

// ============ 숙련도 등급 ============

export const PROFICIENCY_RANKS: RankInfo[] = [
  {
    id: "novice",
    min: 0,
    max: 19,
    nameKo: "초보",
    nameEn: "Novice",
    damageBonus: 0,
    speedBonus: 0,
  },
  {
    id: "apprentice",
    min: 20,
    max: 39,
    nameKo: "견습",
    nameEn: "Apprentice",
    damageBonus: 5,
    speedBonus: 0,
  },
  {
    id: "journeyman",
    min: 40,
    max: 59,
    nameKo: "숙련",
    nameEn: "Journeyman",
    damageBonus: 10,
    speedBonus: 5,
  },
  {
    id: "expert",
    min: 60,
    max: 79,
    nameKo: "전문가",
    nameEn: "Expert",
    damageBonus: 15,
    speedBonus: 10,
  },
  {
    id: "master",
    min: 80,
    max: 99,
    nameKo: "달인",
    nameEn: "Master",
    damageBonus: 20,
    speedBonus: 15,
  },
  {
    id: "grandmaster",
    min: 100,
    max: 100,
    nameKo: "대가",
    nameEn: "Grandmaster",
    damageBonus: 25,
    speedBonus: 20,
  },
];

// ============ 마법 상성 ============

export const MAGIC_EFFECTIVENESS: Record<MagicElement, MagicEffectiveness> = {
  fire: { strong: "ice", weak: "earth" },
  ice: { strong: "lightning", weak: "fire" },
  lightning: { strong: "earth", weak: "ice" },
  earth: { strong: "fire", weak: "lightning" },
  holy: { strong: "dark", weak: "dark" },
  dark: { strong: "holy", weak: "holy" },
};

// ============ 유틸리티 상수 ============

export const WEAPON_TYPES: WeaponType[] = [
  "light_sword",
  "medium_sword",
  "great_sword",
  "axe",
  "mace",
  "dagger",
  "spear",
  "bow",
  "crossbow",
  "staff",
  "fist",
];

export const MAGIC_ELEMENTS: MagicElement[] = [
  "fire",
  "ice",
  "lightning",
  "earth",
  "holy",
  "dark",
];

export const MAX_PROFICIENCY = 100;
export const MIN_PROFICIENCY = 0;

// 상성 데미지 배율
export const EFFECTIVENESS_MULTIPLIER = {
  STRONG: 1.5,
  NORMAL: 1.0,
  WEAK: 0.5,
} as const;

// ============ 요일별 속성 강화 ============

// 요일별 강화 속성 (0=일요일, 1=월요일, ...)
export const DAY_ELEMENT_BOOST: Record<number, MagicElement | null> = {
  0: null,        // 일요일 - 휴식
  1: "ice",       // 월요일 - 월(月)
  2: "fire",      // 화요일 - 화(火)
  3: "lightning", // 수요일 - 수(水)
  4: "earth",     // 목요일 - 목(木)
  5: "holy",      // 금요일 - 금(金)
  6: "dark",      // 토요일 - 토(土)
};

// 요일 강화 배율 (+20%)
export const DAY_BOOST_MULTIPLIER = 1.2;

// 요일 이름 (한국어)
export const DAY_NAMES_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

// ============ 공격 타입 ============

export const ATTACK_TYPE_INFO: Record<AttackType, AttackTypeInfo> = {
  slash: {
    id: "slash",
    nameKo: "베기",
    nameEn: "Slash",
    icon: "⚔️",
    description: "날카로운 칼날로 베는 공격",
  },
  pierce: {
    id: "pierce",
    nameKo: "찌르기",
    nameEn: "Pierce",
    icon: "🗡️",
    description: "뾰족한 끝으로 찌르는 공격",
  },
  crush: {
    id: "crush",
    nameKo: "타격",
    nameEn: "Crush",
    icon: "🔨",
    description: "무거운 무기로 내려치는 공격",
  },
};

// 무기 → 공격 타입 매핑
export const WEAPON_ATTACK_TYPE: Record<WeaponType, AttackType> = {
  light_sword: "pierce",  // 세검 = 찌르기
  medium_sword: "slash",  // 중검 = 베기
  great_sword: "slash",   // 대검 = 베기
  axe: "slash",
  mace: "crush",
  dagger: "pierce",
  spear: "pierce",
  bow: "pierce",
  crossbow: "pierce",
  staff: "crush",
  fist: "crush",
};

// 공격 타입 목록
export const ATTACK_TYPES: AttackType[] = ["slash", "pierce", "crush"];
