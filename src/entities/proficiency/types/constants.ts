import type {
  ProficiencyInfo,
  RankInfo,
  MagicElement,
  MagicEffectiveness,
  WeaponType,
  AttackType,
  AttackTypeInfo,
  CraftingType,
  MedicalType,
  KnowledgeType,
  LifeSkillType,
  ProficiencyRank,
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
  {
    id: "poison",
    nameKo: "독",
    nameEn: "Poison",
    category: "magic",
    relatedStats: ["int", "con"],
    description: "독 계열 마법",
    icon: "☠️",
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
  poison: { strong: null, weak: "holy" }, // 독: 신성에 약함, 특별히 강한 속성 없음
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
  "poison",
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

// ============ 무기막기 시스템 ============

// 무기막기 특수 효과 타입
export type WeaponBlockSpecial =
  | "counter"   // 반격 데미지 (대검)
  | "riposte"   // 즉시 반격 (세검)
  | "stun"      // 1턴 기절 (둔기)
  | "deflect"   // 마법 반사 (지팡이)
  | "disarm";   // 무장해제 (중검)

// 무기막기 설정 정보
export interface WeaponBlockInfo {
  weaponType: WeaponType;
  blockChance: number;           // 기본 막기 확률 (%)
  damageReduction: number;       // 피해 감소율 (0-1)
  specialEffect?: WeaponBlockSpecial;
  specialChance?: number;        // 특수효과 발동 확률 (%)
  nameKo: string;
  description: string;
}

// 무기별 막기 설정
export const WEAPON_BLOCK_CONFIG: Record<WeaponType, WeaponBlockInfo> = {
  // 검류 - 흘리기/패리 스타일
  light_sword: {
    weaponType: "light_sword",
    blockChance: 8,
    damageReduction: 0.4,
    specialEffect: "riposte",
    specialChance: 25,
    nameKo: "흘려막기",
    description: "칼날로 흘리며 즉시 반격",
  },
  medium_sword: {
    weaponType: "medium_sword",
    blockChance: 10,
    damageReduction: 0.5,
    specialEffect: "disarm",
    specialChance: 10,
    nameKo: "검막기",
    description: "검으로 막아내며 상대 무장해제",
  },
  great_sword: {
    weaponType: "great_sword",
    blockChance: 5,
    damageReduction: 0.7,
    specialEffect: "counter",
    specialChance: 30,
    nameKo: "대검 패리",
    description: "대검 패리 - 강력한 반격",
  },

  // 둔기류
  axe: {
    weaponType: "axe",
    blockChance: 6,
    damageReduction: 0.3,
    nameKo: "도끼 막기",
    description: "도끼날로 공격 흘림",
  },
  mace: {
    weaponType: "mace",
    blockChance: 8,
    damageReduction: 0.4,
    specialEffect: "stun",
    specialChance: 15,
    nameKo: "둔기 막기",
    description: "둔기로 막아 충격 전달",
  },

  // 민첩류
  dagger: {
    weaponType: "dagger",
    blockChance: 3,
    damageReduction: 0.2,
    nameKo: "단검 막기",
    description: "단검으로 급소 보호",
  },
  spear: {
    weaponType: "spear",
    blockChance: 12,
    damageReduction: 0.5,
    nameKo: "창대 막기",
    description: "창대로 공격 흘림",
  },

  // 원거리
  bow: {
    weaponType: "bow",
    blockChance: 2,
    damageReduction: 0.1,
    nameKo: "활 막기",
    description: "활로 급소 보호",
  },
  crossbow: {
    weaponType: "crossbow",
    blockChance: 3,
    damageReduction: 0.15,
    nameKo: "석궁 막기",
    description: "석궁으로 급소 보호",
  },

  // 마법/격투
  staff: {
    weaponType: "staff",
    blockChance: 10,
    damageReduction: 0.4,
    specialEffect: "deflect",
    specialChance: 10,
    nameKo: "지팡이 막기",
    description: "지팡이로 마법 흘림",
  },
  fist: {
    weaponType: "fist",
    blockChance: 15,
    damageReduction: 0.3,
    nameKo: "팔막기",
    description: "팔로 공격 막기",
  },
};

// ============ 제작 스킬 정보 ============

export const CRAFTING_PROFICIENCIES: ProficiencyInfo[] = [
  {
    id: "blacksmithing",
    nameKo: "대장장이",
    nameEn: "Blacksmithing",
    category: "crafting",
    relatedStats: ["str", "con"],
    description: "금속 무기/방어구 제작",
    icon: "🔨",
  },
  {
    id: "tailoring",
    nameKo: "재봉",
    nameEn: "Tailoring",
    category: "crafting",
    relatedStats: ["dex"],
    description: "천/가죽 장비 제작",
    icon: "🧵",
  },
  {
    id: "cooking",
    nameKo: "요리",
    nameEn: "Cooking",
    category: "crafting",
    relatedStats: ["wis"],
    description: "음식 버프 아이템 제작",
    icon: "🍳",
  },
  {
    id: "alchemy",
    nameKo: "연금",
    nameEn: "Alchemy",
    category: "crafting",
    relatedStats: ["int", "wis"],
    description: "포션/물약 제작",
    icon: "⚗️",
  },
  {
    id: "jewelcrafting",
    nameKo: "보석세공",
    nameEn: "Jewelcrafting",
    category: "crafting",
    relatedStats: ["dex", "int"],
    description: "악세서리 제작",
    icon: "💎",
  },
];

// ============ 의료 스킬 정보 ============

export const MEDICAL_PROFICIENCIES: ProficiencyInfo[] = [
  {
    id: "first_aid",
    nameKo: "응급처치",
    nameEn: "First Aid",
    category: "medical",
    relatedStats: ["dex", "wis"],
    description: "붕대 치료, 경상 치료",
    icon: "🩹",
  },
  {
    id: "herbalism",
    nameKo: "약초학",
    nameEn: "Herbalism",
    category: "medical",
    relatedStats: ["int", "wis"],
    description: "한방 치료, 중상 치료",
    icon: "🌿",
  },
  {
    id: "surgery",
    nameKo: "수술",
    nameEn: "Surgery",
    category: "medical",
    relatedStats: ["dex", "int"],
    description: "외과 수술, 치명상 치료",
    icon: "🏥",
  },
];

// ============ 지식 스킬 정보 ============

export const KNOWLEDGE_PROFICIENCIES: ProficiencyInfo[] = [
  {
    id: "anatomy",
    nameKo: "해부학",
    nameEn: "Anatomy",
    category: "knowledge",
    relatedStats: ["int"],
    description: "베기/찌르기 데미지 증가",
    icon: "🦴",
  },
  {
    id: "metallurgy",
    nameKo: "금속학",
    nameEn: "Metallurgy",
    category: "knowledge",
    relatedStats: ["int", "str"],
    description: "타격 데미지/방어력 증가",
    icon: "⚙️",
  },
  {
    id: "botany",
    nameKo: "식물학",
    nameEn: "Botany",
    category: "knowledge",
    relatedStats: ["int", "wis"],
    description: "독/치유 효과 증가",
    icon: "🌱",
  },
  {
    id: "gemology",
    nameKo: "보석학",
    nameEn: "Gemology",
    category: "knowledge",
    relatedStats: ["int"],
    description: "마법 데미지 증가",
    icon: "🔮",
  },
];

// ============ 생활 스킬 통합 ============

export const LIFE_SKILL_PROFICIENCIES: ProficiencyInfo[] = [
  ...CRAFTING_PROFICIENCIES,
  ...MEDICAL_PROFICIENCIES,
  ...KNOWLEDGE_PROFICIENCIES,
];

// ============ 전체 숙련 정보 (전투 + 생활) ============

export const ALL_PROFICIENCIES_EXTENDED: ProficiencyInfo[] = [
  ...WEAPON_PROFICIENCIES,
  ...MAGIC_PROFICIENCIES,
  ...LIFE_SKILL_PROFICIENCIES,
];

// 생활 스킬 타입 목록
export const CRAFTING_TYPES: CraftingType[] = [
  "blacksmithing",
  "tailoring",
  "cooking",
  "alchemy",
  "jewelcrafting",
];

export const MEDICAL_TYPES: MedicalType[] = [
  "first_aid",
  "herbalism",
  "surgery",
];

export const KNOWLEDGE_TYPES: KnowledgeType[] = [
  "anatomy",
  "metallurgy",
  "botany",
  "gemology",
];

export const LIFE_SKILL_TYPES: LifeSkillType[] = [
  ...CRAFTING_TYPES,
  ...MEDICAL_TYPES,
  ...KNOWLEDGE_TYPES,
];

// ============ 레벨 기반 숙련도 획득 시스템 ============

// 레벨 차이에 따른 획득 확률 (몬스터레벨 - 플레이어레벨)
export const LEVEL_DIFF_PROFICIENCY_CHANCE: Record<number, number> = {
  3: 0.80,   // +3 이상: 80%
  2: 0.60,   // +2: 60%
  1: 0.40,   // +1: 40%
  0: 0.25,   // 동레벨: 25%
  [-1]: 0.10, // -1: 10%
  // -2 이하: 0% (획득 불가)
};

/**
 * 레벨 차이에 따른 숙련도 획득 확률
 * @param levelDiff 몬스터레벨 - 플레이어레벨
 */
export function getProficiencyGainChance(levelDiff: number): number {
  if (levelDiff >= 3) return 0.80;
  if (levelDiff === 2) return 0.60;
  if (levelDiff === 1) return 0.40;
  if (levelDiff === 0) return 0.25;
  if (levelDiff === -1) return 0.10;
  return 0; // -2 이하
}

// 랭크별 획득량 배율 (고랭크일수록 성장 느림)
export const RANK_GAIN_MULTIPLIER: Record<ProficiencyRank, number> = {
  novice: 1.0,
  apprentice: 0.8,
  journeyman: 0.6,
  expert: 0.4,
  master: 0.2,
  grandmaster: 0.1,
};

// ============ 지식 스킬 전투 보너스 ============

// 지식 스킬 보너스 인터페이스
export interface KnowledgeBonus {
  slashBonus: number;      // 베기 데미지 % 증가
  pierceBonus: number;     // 찌르기 데미지 % 증가
  crushBonus: number;      // 타격 데미지 % 증가
  defenseBonus: number;    // 방어력 % 증가
  poisonBonus: number;     // 독 데미지 % 증가
  healingBonus: number;    // 치유량 % 증가
  magicBonus: number;      // 마법 데미지 % 증가
}

// 지식 스킬별 보너스 계수 (랭크당)
export const KNOWLEDGE_BONUS_PER_RANK: Record<KnowledgeType, Partial<KnowledgeBonus>> = {
  anatomy: {
    slashBonus: 0.5,   // 랭크당 +0.5%
    pierceBonus: 0.5,
  },
  metallurgy: {
    crushBonus: 0.5,
    defenseBonus: 0.3,
  },
  botany: {
    poisonBonus: 0.5,
    healingBonus: 1.0,  // 치유는 더 높은 보너스
  },
  gemology: {
    magicBonus: 0.3,    // 마법 전체에 적용
  },
};

/**
 * 지식 스킬 숙련도로 전투 보너스 계산
 * @param knowledgeProficiencies 지식 스킬 숙련도 객체
 * @returns 전투 보너스 객체
 */
export function calculateKnowledgeBonus(
  knowledgeProficiencies: Partial<Record<KnowledgeType, number>>
): KnowledgeBonus {
  const bonus: KnowledgeBonus = {
    slashBonus: 0,
    pierceBonus: 0,
    crushBonus: 0,
    defenseBonus: 0,
    poisonBonus: 0,
    healingBonus: 0,
    magicBonus: 0,
  };

  // 각 지식 스킬별 보너스 계산
  for (const [skill, level] of Object.entries(knowledgeProficiencies)) {
    const skillType = skill as KnowledgeType;
    const bonusConfig = KNOWLEDGE_BONUS_PER_RANK[skillType];
    if (!bonusConfig || !level) continue;

    // 랭크 계산 (0-19: 0, 20-39: 1, 40-59: 2, ...)
    const rankIndex = Math.min(5, Math.floor(level / 20));

    for (const [bonusType, perRank] of Object.entries(bonusConfig)) {
      if (perRank) {
        bonus[bonusType as keyof KnowledgeBonus] += rankIndex * perRank;
      }
    }
  }

  return bonus;
}

// ============ 지식 스킬 연관 공격 타입 ============

// 어떤 공격 타입이 어떤 지식 스킬을 올리는지
export const ATTACK_TYPE_TO_KNOWLEDGE: Record<AttackType, KnowledgeType> = {
  slash: "anatomy",
  pierce: "anatomy",
  crush: "metallurgy",
};
