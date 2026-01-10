// 능력치 시스템
export interface CharacterStats {
  str: number; // 힘 - 물리 공격력, 무게 제한
  dex: number; // 민첩 - 명중, 회피
  con: number; // 체력 - HP, 방어력
  int: number; // 지능 - 마법 공격력, 마나
  wis: number; // 지혜 - 마법 방어, 마나 회복
  cha: number; // 매력 - 상점 가격, NPC 호감도
  lck: number; // 행운 - 치명타 확률, 치명타 피해
  ambushChance: number; // 암습 확률 (%)
  ambushDamage: number; // 암습 추가 피해 (%)
}

export const STAT_NAMES: Record<keyof CharacterStats, { ko: string; desc: string }> = {
  str: { ko: "힘", desc: "물리 공격력, 무게 제한" },
  dex: { ko: "민첩", desc: "명중, 회피" },
  con: { ko: "체력", desc: "HP, 방어력" },
  int: { ko: "지능", desc: "마법 공격력, 마나" },
  wis: { ko: "지혜", desc: "마법 방어, 마나 회복" },
  cha: { ko: "매력", desc: "상점 가격, NPC 호감도" },
  lck: { ko: "행운", desc: "치명타 확률, 치명타 피해" },
  ambushChance: { ko: "암습 확률", desc: "전투 첫 공격 암습 확률 (%)" },
  ambushDamage: { ko: "암습 피해", desc: "암습 성공 시 추가 피해 (%)" },
};

// 기본 스탯 (모든 종족 공통)
export const BASE_STATS: CharacterStats = {
  str: 10,
  dex: 10,
  con: 10,
  int: 10,
  wis: 10,
  cha: 10,
  lck: 10,
  ambushChance: 0, // 기본 0%
  ambushDamage: 0, // 기본 0%
};

// 배분 가능한 보너스 포인트
export const BONUS_POINTS = 10;
export const MAX_STAT = 20;
export const MIN_STAT = 5;

// 성별
export type Gender = "male" | "female";

export const GENDERS = [
  { id: "male" as Gender, name: "남성", icon: "♂" },
  { id: "female" as Gender, name: "여성", icon: "♀" },
];

// 종족 내 바디 타입
export interface BodyType {
  index: number;
  name: string;
}

// 종족 (여러 body type 지원)
export interface Race {
  id: string;
  name: string;
  bodyTypes: BodyType[];
  description: string;
  // 종족별 기본 스탯 보너스
  statBonus: Partial<CharacterStats>;
}

export const RACES: Race[] = [
  {
    id: "human",
    name: "인간",
    bodyTypes: [
      { index: 0, name: "기본" },
      { index: 1, name: "건장한" },
      { index: 2, name: "날씬한" },
      { index: 3, name: "근육질" },
    ],
    description: "균형 잡힌 능력치",
    statBonus: { cha: 2 },
  },
  {
    id: "elf",
    name: "엘프",
    bodyTypes: [
      { index: 4, name: "기본" },
      { index: 5, name: "우아한" },
    ],
    description: "민첩하고 마법 친화적",
    statBonus: { dex: 1, int: 1 },
  },
  {
    id: "orc",
    name: "오크",
    bodyTypes: [
      { index: 6, name: "기본" },
      { index: 7, name: "거대한" },
    ],
    description: "강인한 체력",
    statBonus: { str: 2, con: 1, cha: -1 },
  },
  {
    id: "dwarf",
    name: "드워프",
    bodyTypes: [
      { index: 8, name: "기본" },
      { index: 9, name: "땅딸막한" },
    ],
    description: "단단한 방어력",
    statBonus: { con: 2, wis: 1, dex: -1 },
  },
  {
    id: "darkelf",
    name: "다크엘프",
    bodyTypes: [
      { index: 10, name: "기본" },
      { index: 11, name: "그림자" },
    ],
    description: "은밀한 공격",
    statBonus: { dex: 2, int: 1, cha: -1 },
  },
  {
    id: "goblin",
    name: "고블린",
    bodyTypes: [
      { index: 12, name: "기본" },
      { index: 13, name: "교활한" },
    ],
    description: "빠른 이동속도",
    statBonus: { dex: 2, cha: -1 },
  },
];

// 스탯 계산 유틸
export function calculateTotalStats(
  raceBonus: Partial<CharacterStats>,
  allocatedStats: CharacterStats
): CharacterStats {
  const result = { ...BASE_STATS };

  // 종족 보너스 적용
  for (const [key, value] of Object.entries(raceBonus)) {
    result[key as keyof CharacterStats] += value;
  }

  // 배분된 스탯 적용
  for (const [key, value] of Object.entries(allocatedStats)) {
    result[key as keyof CharacterStats] += value - BASE_STATS[key as keyof CharacterStats];
  }

  return result;
}
