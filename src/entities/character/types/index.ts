// ============ 캐릭터 외형 타입 ============

export interface CharacterAppearance {
  bodyIndex: number;
  eyeIndex: number;
  hairIndex: number;
  facehairIndex: number;
  clothIndex: number;
  armorIndex: number;
  pantIndex: number;
  helmetIndex: number;
  backIndex: number;
}

export interface CharacterColors {
  body: string;
  eye: string;
  hair: string;
  facehair: string;
  cloth: string;
  armor: string;
  pant: string;
}

// ============ 저장된 캐릭터 타입 ============

export interface SavedCharacter {
  id: string;
  name: string;
  isMain: boolean;
  gender?: "male" | "female";
  race?: string;
  bodyType?: number;
  preset?: string;
  appearance: CharacterAppearance;
  colors: CharacterColors;
  stats?: CharacterStats;
  createdAt?: string;
}

// ============ 속성 강화/저항 타입 ============

export type ElementType =
  | "fire"
  | "ice"
  | "lightning"
  | "earth"
  | "holy"
  | "dark"
  | "poison";

// 7속성 강화율 (%)
export interface ElementBoost {
  fire: number;
  ice: number;
  lightning: number;
  earth: number;
  holy: number;
  dark: number;
  poison: number;
}

// 7속성 저항율 (%)
export interface ElementResist {
  fire: number;
  ice: number;
  lightning: number;
  earth: number;
  holy: number;
  dark: number;
  poison: number;
}

export const DEFAULT_ELEMENT_BOOST: ElementBoost = {
  fire: 0,
  ice: 0,
  lightning: 0,
  earth: 0,
  holy: 0,
  dark: 0,
  poison: 0,
};

export const DEFAULT_ELEMENT_RESIST: ElementResist = {
  fire: 0,
  ice: 0,
  lightning: 0,
  earth: 0,
  holy: 0,
  dark: 0,
  poison: 0,
};

// ============ 물리 저항 타입 ============

/**
 * 물리 공격 타입별 저항 배율
 * 1.0 = 보통 (100% 데미지)
 * 1.5 = 약함 (150% 데미지)
 * 0.5 = 강함 (50% 데미지)
 */
export interface PhysicalResistance {
  slashResist: number; // 베기 저항
  pierceResist: number; // 찌르기 저항
  crushResist: number; // 타격 저항
}

export const DEFAULT_PHYSICAL_RESISTANCE: PhysicalResistance = {
  slashResist: 1.0,
  pierceResist: 1.0,
  crushResist: 1.0,
};

// ============ 캐릭터 스탯 타입 ============

export interface CharacterStats {
  // 기본 능력치
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  lck: number; // 행운 - 치명타 확률 및 피해량

  // 전투 스탯 (선택적 - 기존 데이터 호환)
  physicalAttack?: number; // 물리공격력
  physicalDefense?: number; // 물리방어력
  magicAttack?: number; // 마법공격력
  magicDefense?: number; // 마법방어력

  // 속성 스탯 (선택적 - 기존 데이터 호환)
  elementBoost?: ElementBoost; // 속성 강화 (%)
  elementResist?: ElementResist; // 속성 저항 (%)

  // 암습 스탯 (선택적 - 기존 데이터 호환)
  ambushChance?: number; // 암습 확률 (%)
  ambushDamage?: number; // 암습 추가 피해 (%)

  // 물리 저항 (선택적 - 기존 데이터 호환)
  physicalResistance?: PhysicalResistance;

  // 전투 추가 스탯 (선택적 - 기존 데이터 호환)
  dodgeChance?: number;           // 회피 확률 추가 (%)
  blockChance?: number;           // 막기 확률 추가 (%)
  weaponBlockChance?: number;     // 무기막기 확률 (%)
  physicalPenetration?: number;   // 물리관통 (%)
  magicPenetration?: number;      // 마법관통 (%)
}

// 기본 CharacterStats 생성 (기존 데이터 호환용)
export const DEFAULT_CHARACTER_STATS: CharacterStats = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
  lck: 10,
  physicalAttack: 0,
  physicalDefense: 0,
  magicAttack: 0,
  magicDefense: 0,
  elementBoost: DEFAULT_ELEMENT_BOOST,
  elementResist: DEFAULT_ELEMENT_RESIST,
  ambushChance: 0,
  ambushDamage: 0,
  physicalResistance: DEFAULT_PHYSICAL_RESISTANCE,
  dodgeChance: 0,
  blockChance: 0,
  weaponBlockChance: 0,
  physicalPenetration: 0,
  magicPenetration: 0,
};

// 기존 데이터에서 새 스탯 형식으로 변환 (호환성)
export function normalizeCharacterStats(
  stats: Partial<CharacterStats> | undefined
): CharacterStats {
  if (!stats) return DEFAULT_CHARACTER_STATS;

  return {
    str: stats.str ?? 10,
    dex: stats.dex ?? 10,
    con: stats.con ?? 10,
    int: stats.int ?? 10,
    wis: stats.wis ?? 10,
    cha: stats.cha ?? 10,
    lck: stats.lck ?? 10,
    physicalAttack: stats.physicalAttack ?? 0,
    physicalDefense: stats.physicalDefense ?? 0,
    magicAttack: stats.magicAttack ?? 0,
    magicDefense: stats.magicDefense ?? 0,
    elementBoost: stats.elementBoost ?? DEFAULT_ELEMENT_BOOST,
    elementResist: stats.elementResist ?? DEFAULT_ELEMENT_RESIST,
    ambushChance: stats.ambushChance ?? 0,
    ambushDamage: stats.ambushDamage ?? 0,
    physicalResistance: stats.physicalResistance ?? DEFAULT_PHYSICAL_RESISTANCE,
    dodgeChance: stats.dodgeChance ?? 0,
    blockChance: stats.blockChance ?? 0,
    weaponBlockChance: stats.weaponBlockChance ?? 0,
    physicalPenetration: stats.physicalPenetration ?? 0,
    magicPenetration: stats.magicPenetration ?? 0,
  };
}

