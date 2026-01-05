import type { MagicElement } from "@/entities/proficiency";

// 몬스터 스탯
export interface MonsterStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
}

// 몬스터 드롭 아이템
export interface MonsterDrop {
  itemId: string;
  chance: number; // 0-1
  quantity: [number, number]; // [min, max]
}

// 몬스터 보상
export interface MonsterRewards {
  exp: number;
  gold: number;
}

// 몬스터 행동 패턴
export type MonsterBehavior = "passive" | "aggressive" | "defensive";

// 몬스터 설명
export interface MonsterDescription {
  ko: string;
  en: string;
}

// 몬스터 데이터
export interface Monster {
  id: string;
  nameKo: string;
  nameEn: string;
  mapId: string;
  level: number;
  element: MagicElement | null;
  stats: MonsterStats;
  rewards: MonsterRewards;
  drops: MonsterDrop[];
  behavior: MonsterBehavior;
  icon: string;
  description?: MonsterDescription;
}

// JSON 파일 구조
export interface MonstersData {
  version: string;
  generatedAt: string;
  monsters: Monster[];
  summary: {
    total: number;
    byMap: Record<string, number>;
    byElement: Record<string, number>;
  };
}
