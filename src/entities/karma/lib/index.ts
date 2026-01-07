import {
  KARMA_RANKS,
  ALIGNMENT_INFO,
  DEFAULT_ALIGNMENT_BY_TYPE,
  type KarmaRank,
  type KarmaRankInfo,
  type MonsterAlignment,
} from "../types";
import type { MonsterType } from "@/entities/monster";

// ============ 카르마 등급 계산 ============

/**
 * 카르마 값으로 등급 정보 조회
 */
export function getKarmaRankInfo(karma: number): KarmaRankInfo {
  for (const rank of KARMA_RANKS) {
    if (karma >= rank.min && karma <= rank.max) {
      return rank;
    }
  }
  // 기본값 (중립)
  return KARMA_RANKS.find((r) => r.id === "neutral")!;
}

/**
 * 카르마 등급 ID 조회
 */
export function getKarmaRank(karma: number): KarmaRank {
  return getKarmaRankInfo(karma).id;
}

/**
 * 카르마 표시 문자열 생성
 * 예: "+45 선량", "-70 사악", "0 중립"
 */
export function formatKarma(karma: number): string {
  const rank = getKarmaRankInfo(karma);
  const sign = karma > 0 ? "+" : "";
  return `${sign}${karma} ${rank.nameKo}`;
}

/**
 * 카르마에 따른 색상 반환
 */
export function getKarmaColor(karma: number): string {
  const rank = getKarmaRankInfo(karma);
  return rank.color;
}

// ============ 카르마 변화량 계산 ============

/**
 * 몬스터 처치 시 카르마 변화량 계산
 * @param alignment 몬스터 성향
 * @param monsterLevel 몬스터 레벨
 * @returns 카르마 변화량 (음수 = 감소, 양수 = 증가)
 */
export function calculateKarmaChange(
  alignment: MonsterAlignment,
  monsterLevel: number
): number {
  const baseChange = ALIGNMENT_INFO[alignment].baseKarmaChange;

  if (baseChange === 0) return 0;

  // 레벨 보정: 1 + (레벨 - 1) * 0.1
  const levelMultiplier = 1 + (monsterLevel - 1) * 0.1;

  return Math.round(baseChange * levelMultiplier);
}

/**
 * 몬스터 타입에서 기본 성향 조회
 */
export function getDefaultAlignment(monsterType: MonsterType): MonsterAlignment {
  return DEFAULT_ALIGNMENT_BY_TYPE[monsterType] || "neutral";
}

// ============ 카르마 버프 계산 ============

/**
 * 카르마에 따른 신성 마법 배율
 */
export function getHolyMultiplier(karma: number): number {
  return getKarmaRankInfo(karma).holyMultiplier;
}

/**
 * 카르마에 따른 암흑 마법 배율
 */
export function getDarkMultiplier(karma: number): number {
  return getKarmaRankInfo(karma).darkMultiplier;
}

/**
 * 카르마에 따른 마법 속성 배율 조회
 * @param element 마법 속성
 * @param karma 카르마 값
 */
export function getKarmaElementMultiplier(
  element: string,
  karma: number
): number {
  if (element === "holy") {
    return getHolyMultiplier(karma);
  }
  if (element === "dark") {
    return getDarkMultiplier(karma);
  }
  return 1.0;
}

// ============ 성향 정보 ============

/**
 * 성향 표시 문자열 생성
 */
export function formatAlignment(alignment: MonsterAlignment): string {
  const info = ALIGNMENT_INFO[alignment];
  return `${info.icon} ${info.nameKo}`;
}
