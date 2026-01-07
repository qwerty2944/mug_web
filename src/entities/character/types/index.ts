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

export interface CharacterStats {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  lck: number; // 행운 - 치명타 확률 및 피해량
  ambushChance: number; // 암습 확률 (%)
  ambushDamage: number; // 암습 추가 피해 (%)
}

