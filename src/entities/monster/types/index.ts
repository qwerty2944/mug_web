import type { MagicElement } from "@/entities/proficiency";
import type { Period } from "@/entities/game-time";
import type { MonsterAlignment } from "@/entities/karma";

// ============ 몬스터 종족 타입 ============

export type MonsterType =
  | "beast"      // 야수 (동물, 마수)
  | "humanoid"   // 인간형 (고블린, 도적)
  | "undead"     // 언데드 (스켈레톤, 좀비)
  | "demon"      // 악마 (임프, 악마)
  | "dragon"     // 용족 (드래곤, 와이번)
  | "spirit"     // 정령 (원소 정령)
  | "construct"  // 구조물 (골렘, 허수아비)
  | "plant";     // 식물 (트렌트)

export interface MonsterTypeInfo {
  nameKo: string;
  nameEn: string;
  icon: string;
  dropsGold: boolean;
  description: string;
}

export const MONSTER_TYPE_INFO: Record<MonsterType, MonsterTypeInfo> = {
  beast: {
    nameKo: "야수",
    nameEn: "Beast",
    icon: "🐾",
    dropsGold: false,
    description: "야생 동물과 마수",
  },
  humanoid: {
    nameKo: "인간형",
    nameEn: "Humanoid",
    icon: "👤",
    dropsGold: true,
    description: "지능을 가진 인간형 존재",
  },
  undead: {
    nameKo: "언데드",
    nameEn: "Undead",
    icon: "💀",
    dropsGold: true,
    description: "죽은 자들",
  },
  demon: {
    nameKo: "악마",
    nameEn: "Demon",
    icon: "👿",
    dropsGold: true,
    description: "마계의 존재",
  },
  dragon: {
    nameKo: "용족",
    nameEn: "Dragon",
    icon: "🐉",
    dropsGold: true,
    description: "드래곤과 그 아종",
  },
  spirit: {
    nameKo: "정령",
    nameEn: "Spirit",
    icon: "✨",
    dropsGold: false,
    description: "원소의 정령",
  },
  construct: {
    nameKo: "구조물",
    nameEn: "Construct",
    icon: "🗿",
    dropsGold: false,
    description: "만들어진 존재",
  },
  plant: {
    nameKo: "식물",
    nameEn: "Plant",
    icon: "🌿",
    dropsGold: false,
    description: "식물형 몬스터",
  },
};

// ============ 물리 저항 ============

/**
 * 물리 공격 타입별 저항 배율
 * 1.0 = 보통 (100% 데미지)
 * 1.5 = 약함 (150% 데미지)
 * 0.5 = 강함 (50% 데미지)
 */
export interface PhysicalResistance {
  slashResist: number;   // 베기 저항
  pierceResist: number;  // 찌르기 저항
  crushResist: number;   // 타격 저항
}

export const DEFAULT_PHYSICAL_RESISTANCE: PhysicalResistance = {
  slashResist: 1.0,
  pierceResist: 1.0,
  crushResist: 1.0,
};

// ============ 몬스터 스탯 ============

// 몬스터 스탯
export interface MonsterStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  resistance?: PhysicalResistance;  // 물리 저항 (없으면 모두 1.0)
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

// 몬스터 출현 조건
export interface SpawnCondition {
  period?: Period[]; // 출현 가능한 시간대 (null이면 항상 출현)
}

// 몬스터 데이터
export interface Monster {
  id: string;
  nameKo: string;
  nameEn: string;
  type: MonsterType;
  alignment: MonsterAlignment;
  mapId: string;
  level: number;
  element: MagicElement | null;
  stats: MonsterStats;
  rewards: MonsterRewards;
  drops: MonsterDrop[];
  behavior: MonsterBehavior;
  icon: string;
  description?: MonsterDescription;
  spawnCondition?: SpawnCondition; // 출현 조건 (null이면 항상 출현)
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
    byType: Record<string, number>;
    byAlignment: Record<MonsterAlignment, number>;
  };
}
