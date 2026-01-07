// ============ 카르마 등급 ============

export type KarmaRank =
  | "abyssal"   // -100 ~ -80: 심연
  | "evil"      // -79 ~ -50: 사악
  | "wicked"    // -49 ~ -20: 불량
  | "neutral"   // -19 ~ +19: 중립
  | "virtuous"  // +20 ~ +49: 선량
  | "holy"      // +50 ~ +79: 신성
  | "saintly";  // +80 ~ +100: 성인

export interface KarmaRankInfo {
  id: KarmaRank;
  min: number;
  max: number;
  nameKo: string;
  nameEn: string;
  icon: string;
  color: string;
  // 마법 배율
  holyMultiplier: number;
  darkMultiplier: number;
}

export const KARMA_RANKS: KarmaRankInfo[] = [
  {
    id: "abyssal",
    min: -100,
    max: -80,
    nameKo: "심연",
    nameEn: "Abyssal",
    icon: "👿",
    color: "#8B0000", // 다크레드
    holyMultiplier: 0.7,  // 신성 -30%
    darkMultiplier: 1.2,  // 암흑 +20%
  },
  {
    id: "evil",
    min: -79,
    max: -50,
    nameKo: "사악",
    nameEn: "Evil",
    icon: "😈",
    color: "#DC143C", // 크림슨
    holyMultiplier: 0.85,
    darkMultiplier: 1.1,
  },
  {
    id: "wicked",
    min: -49,
    max: -20,
    nameKo: "불량",
    nameEn: "Wicked",
    icon: "🖤",
    color: "#A0522D", // 시에나
    holyMultiplier: 1.0,
    darkMultiplier: 1.0,
  },
  {
    id: "neutral",
    min: -19,
    max: 19,
    nameKo: "중립",
    nameEn: "Neutral",
    icon: "⚖️",
    color: "#808080", // 그레이
    holyMultiplier: 1.0,
    darkMultiplier: 1.0,
  },
  {
    id: "virtuous",
    min: 20,
    max: 49,
    nameKo: "선량",
    nameEn: "Virtuous",
    icon: "💙",
    color: "#4682B4", // 스틸블루
    holyMultiplier: 1.0,
    darkMultiplier: 1.0,
  },
  {
    id: "holy",
    min: 50,
    max: 79,
    nameKo: "신성",
    nameEn: "Holy",
    icon: "😇",
    color: "#FFD700", // 골드
    holyMultiplier: 1.1,
    darkMultiplier: 0.85,
  },
  {
    id: "saintly",
    min: 80,
    max: 100,
    nameKo: "성인",
    nameEn: "Saintly",
    icon: "👼",
    color: "#FFFFFF", // 화이트
    holyMultiplier: 1.2,
    darkMultiplier: 0.7,
  },
];

// ============ 몬스터 성향 ============

export type MonsterAlignment = "good" | "neutral" | "evil";

export interface AlignmentInfo {
  id: MonsterAlignment;
  nameKo: string;
  nameEn: string;
  icon: string;
  baseKarmaChange: number;
}

export const ALIGNMENT_INFO: Record<MonsterAlignment, AlignmentInfo> = {
  good: {
    id: "good",
    nameKo: "선",
    nameEn: "Good",
    icon: "😇",
    baseKarmaChange: -10,
  },
  neutral: {
    id: "neutral",
    nameKo: "중립",
    nameEn: "Neutral",
    icon: "⚖️",
    baseKarmaChange: 0,
  },
  evil: {
    id: "evil",
    nameKo: "악",
    nameEn: "Evil",
    icon: "😈",
    baseKarmaChange: 5,
  },
};

// ============ 몬스터 타입별 기본 성향 ============

import type { MonsterType } from "@/entities/monster";

export const DEFAULT_ALIGNMENT_BY_TYPE: Record<MonsterType, MonsterAlignment> = {
  beast: "neutral",
  humanoid: "neutral",
  undead: "evil",
  demon: "evil",
  dragon: "neutral",
  spirit: "neutral",
  construct: "neutral",
  plant: "neutral",
};
